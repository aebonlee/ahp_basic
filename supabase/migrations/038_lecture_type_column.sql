-- 강의 유형(무료/1:1 맞춤) 및 희망일 단일 날짜 컬럼 추가
ALTER TABLE public.lecture_applications
  ADD COLUMN IF NOT EXISTS lecture_type text NOT NULL DEFAULT 'free';

ALTER TABLE public.lecture_applications
  ADD COLUMN IF NOT EXISTS preferred_date text;
