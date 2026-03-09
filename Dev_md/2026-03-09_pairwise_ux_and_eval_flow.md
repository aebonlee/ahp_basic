# 평가자 화면 UX 개선 — 쌍대비교 정렬 & 평가 완료 플로우

**작업일**: 2026-03-09

## 개요
평가자 쌍대비교 화면의 레이아웃 문제 수정 및 평가 완료 플로우를 개선.

## 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/styles/variables.css` | `--label-width-desktop` 200px → 240px (기준명 2줄 방지) |
| `src/components/evaluation/PairwiseGrid.jsx` | scaleNumbers를 `.cells` 컨테이너로 감싸서 gap:2px 정렬 |
| `src/pages/PairwiseRatingPage.jsx` | 결과 영역 하단/우측 배치 토글 추가, body 래퍼 구조 변경 |
| `src/pages/PairwiseRatingPage.module.css` | `.layoutBtn`, `.body`, `.bodyRight`, `.gridArea`, `.resultsRight` 스타일 추가 |
| `src/pages/EvalResultPage.jsx` | 상단 네비게이션 바 추가 (평가 돌아가기, 설문 응답 확인, 평가 목록) |
| `src/pages/EvalResultPage.module.css` | `.navBar`, `.navRight` 스타일 추가 |
| `src/components/evaluation/PageNavigator.jsx` | 마지막 페이지 버튼 텍스트: "결과 보기" → "평가 완료 및 결과 확인" |

## 상세 변경

### 1. 쌍대비교 그리드 정렬 수정
- **문제**: 스케일 숫자(987654321...) 행에 `gap`이 없어서 셀 박스와 위치가 어긋남
- **원인**: `.cells`는 `gap: 2px`가 있지만 `.scaleNumbers`는 없었음 (17개 셀에서 16*2=32px 누적 차이)
- **해결**: scaleNum들을 `.cells` 컨테이너로 감싸서 동일한 gap 적용

### 2. 라벨 너비 확대
- `--label-width-desktop`: 200px → 240px
- 하위 기준 이름이 2줄로 표시되는 문제 해결

### 3. 결과 영역 배치 토글
- [하단 배치] / [우측 배치] 토글 버튼 추가
- 하단(기본): 기존과 동일, 그리드 아래에 결과 표시
- 우측: 그리드 옆에 300px 고정 폭으로 결과 패널 sticky 배치

### 4. 평가 결과 페이지 네비게이션 개선
- 상단에 네비게이션 바 추가:
  - "평가로 돌아가기" — 쌍대비교 페이지로 이동
  - "설문 응답 확인" — 인구통계학적 설문 페이지 (설문이 있는 경우만 표시)
  - "평가 목록" — 평가자 메인 페이지

### 5. 마지막 페이지 완료 버튼 강화
- PageNavigator 마지막 페이지: "결과 보기" → "✔ 평가 완료 및 결과 확인"

## 검증
- `npm run build` 성공
