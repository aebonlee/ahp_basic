# 통계 분석별 변수 제약사항 가이드 섹션 추가

## 날짜
2026-03-10

## 개요
통계 가이드 페이지에 "11. 통계 분석별 변수 제약사항" 섹션을 추가하여,
각 분석이 요구하는 변수 유형/개수와 현재 설문 구성에 따른 사용 가능 여부를 안내한다.

## 수정 내용

### 1. GUIDE_SECTIONS에 새 섹션 추가 — `StatisticalAnalysisPage.jsx`

**섹션 구조:**
- `constraintIntro`: 소개문 (파란색 안내 박스)
- `table`: 10개 분석별 제약사항 테이블
  - 분석 방법, 필요 변수, 최소 개수, 수치 변수 1개일 때, 수치 변수 2개+ 일 때
  - 가능: ✅, 불가: ❌, 해당 없음: — (범주형 필요)
- `constraintNotes`: 참고 사항 (보라색 박스)
  - 수치형 변수 설명 (숫자, 리커트)
  - 범주형 변수 설명 (라디오, 드롭다운, 체크박스)
  - 변수 부족 시 안내 동작
  - 해결 방법 안내

### 2. StatsGuide 렌더러 확장

- `constraintIntro` 렌더링: `<p className={styles.guideIntro}>` — 파란색 안내 박스
- `constraintNotes` 렌더링: 참고 사항 리스트 (보라색 배경)

### 3. CSS 스타일 추가 — `StatisticalAnalysisPage.module.css`

- `.guideIntro` — 소개문 (파란 배경 #eff6ff)
- `.constraintNotes` — 참고 사항 컨테이너 (보라 배경 #f5f3ff)
- `.constraintNoteItem` — 개별 항목 (화살표 아이콘 + 굵은 라벨)

## 수정 파일
- `src/pages/StatisticalAnalysisPage.jsx` — GUIDE_SECTIONS에 섹션 11 추가, StatsGuide 렌더러 확장
- `src/pages/StatisticalAnalysisPage.module.css` — guideIntro, constraintNotes 스타일

## 영향 범위
- 통계 가이드 페이지에서 "11. 통계 분석별 변수 제약사항" 섹션 확인 가능
- 기존 섹션 1~10에는 변경 없음
