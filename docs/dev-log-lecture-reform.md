# 온라인 강의 페이지 개편 개발일지

## 날짜: 2026-03-16

## 변경 사항

### 1. 강의 유형 분리
- 기존: 고정된 2개 일정(3/19, 3/26) 하드코딩 + 체크박스 선택
- 변경: **무료강의** + **1:1 맞춤강의** 2개 카드 선택 방식
  - 무료강의: AHP Basic 사용법 소개 (40분, 무료)
  - 1:1 맞춤강의: 연구프로젝트 설정 맞춤 컨설팅 (40분, 무료)

### 2. 일정 선택 방식 변경
- 기존: 하드코딩된 날짜 체크박스
- 변경: 네이티브 date picker로 희망일 직접 선택 (오늘+1 이후만 선택 가능)

### 3. SMS 접수 확인 문자 발송
- 신청 완료 시 `sendSms()`로 접수 확인 문자 자동 발송
- SMS 실패해도 신청 자체는 성공 처리

### 4. DB 스키마 변경
- `lecture_applications` 테이블에 `lecture_type`, `preferred_date` 컬럼 추가
- 기존 `preferred_dates` text[] 컬럼은 호환성을 위해 유지

## 변경 파일
- `src/pages/LectureApplyPage.jsx` — 전면 개편
- `src/pages/LectureApplyPage.module.css` — 카드 스타일 변경
- `supabase/migrations/038_lecture_type_column.sql` — DB 마이그레이션
