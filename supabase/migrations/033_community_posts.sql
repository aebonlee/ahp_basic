-- 033: community_posts 테이블 + RLS + RPC
-- 커뮤니티 게시판 (공지사항, Q&A, 연구팀원 모집, 평가자 모집)

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('notice','qna','recruit-team','recruit-evaluator')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

-- RLS 활성화
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자 (익명 포함)
CREATE POLICY "community_posts_select" ON community_posts
  FOR SELECT USING (true);

-- 작성: 로그인 사용자만
CREATE POLICY "community_posts_insert" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 수정: 본인만
CREATE POLICY "community_posts_update" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 삭제: 본인 또는 superadmin
CREATE POLICY "community_posts_delete" ON community_posts
  FOR DELETE USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- RPC: 게시글 목록 조회
CREATE OR REPLACE FUNCTION get_community_posts(
  p_category TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  views INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    cp.id, cp.category, cp.title, cp.content,
    cp.author_id, cp.author_name, cp.views,
    cp.created_at, cp.updated_at
  FROM community_posts cp
  WHERE cp.category = p_category
  ORDER BY cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- RPC: 게시글 작성
CREATE OR REPLACE FUNCTION create_community_post(
  p_category TEXT,
  p_title TEXT,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_name TEXT;
BEGIN
  -- 로그인 확인
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- 카테고리 확인
  IF p_category NOT IN ('notice','qna','recruit-team','recruit-evaluator') THEN
    RAISE EXCEPTION 'Invalid category: %', p_category;
  END IF;

  -- 공지사항은 superadmin만
  IF p_category = 'notice' THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    ) THEN
      RAISE EXCEPTION 'Only superadmin can post notices';
    END IF;
  END IF;

  -- 작성자 이름
  SELECT display_name INTO v_name
  FROM user_profiles WHERE user_id = auth.uid();

  INSERT INTO community_posts (category, title, content, author_id, author_name)
  VALUES (p_category, p_title, p_content, auth.uid(), COALESCE(v_name, '익명'))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- RPC: 게시글 삭제
CREATE OR REPLACE FUNCTION delete_community_post(p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM community_posts
  WHERE id = p_post_id
    AND (
      author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'superadmin'
      )
    );

  RETURN FOUND;
END;
$$;

-- RPC: 조회수 증가
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE community_posts
  SET views = views + 1
  WHERE id = p_post_id;
$$;
