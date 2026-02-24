-- 기존 관리자 이메일에 admin role 설정
-- 이 마이그레이션 적용 후 AuthContext의 BOOTSTRAP_ADMIN_EMAILS 제거 가능

UPDATE public.user_profiles
SET role = 'admin'
WHERE email IN ('aebon@kakao.com', 'aebon@kyonggi.ac.kr', 'ryuwebpd@gmail.com');
