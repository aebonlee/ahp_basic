import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useCommunityPosts(category, pageSize = 20) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (offset = 0) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_community_posts', {
      p_category: category,
      p_limit: pageSize + 1,
      p_offset: offset,
    });
    if (error) {
      setPosts([]);
      setHasMore(false);
    } else {
      const items = data || [];
      setHasMore(items.length > pageSize);
      setPosts(items.slice(0, pageSize));
    }
    setLoading(false);
  }, [category, pageSize]);

  useEffect(() => {
    setPage(0);
    fetchPosts(0);
  }, [category, fetchPosts]);

  useEffect(() => {
    if (page > 0) {
      fetchPosts(page * pageSize);
    }
  }, [page, fetchPosts, pageSize]);

  return {
    posts,
    loading,
    page,
    setPage,
    hasMore,
    refresh: () => fetchPosts(page * pageSize),
  };
}

export async function createPost(category, title, content) {
  const { data, error } = await supabase.rpc('create_community_post', {
    p_category: category,
    p_title: title,
    p_content: content,
  });
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  const { data, error } = await supabase.rpc('delete_community_post', {
    p_post_id: postId,
  });
  if (error) throw error;
  return data;
}

export async function incrementViews(postId) {
  await supabase.rpc('increment_post_views', { p_post_id: postId });
}
