# 2026-03-09 개발 내역: 기준 종합중요도 바 굵기 통일 + 라벨 한줄 표시

## 배경
- 상위기준 바 트랙에 `padding-top: 10px` + `border-top: 1px`이 적용되어 `box-sizing: border-box` 환경에서 바 내용 영역이 9px로 줄어듦 (하위기준은 20px) → 바 굵기 불일치
- 구분선/여백 처리가 셀 padding으로 되어 있어 레이아웃 일그러짐, 하위기준 라벨이 2줄로 표시

## 수정 내용

| 파일 | 변경 |
|------|------|
| `src/components/results/ResultSummary.jsx` | 구분선을 `barDivider` 별도 요소(`grid-column: 1/-1`)로 분리, `barRowTop`/`barRowSub` 클래스 제거하고 단일 `barRow` 사용, 인덴트 간격 축소(16→12px) |
| `src/styles/results.module.css` | `padding-top`/`border-top` 셀 해킹 모두 제거, `.barDivider` 추가(full-width 1px 구분선), `.barTrack` height 20px 통일 |

## 결과
- 모든 행의 바 높이 20px로 통일
- 구분선은 그리드 전체 너비를 차지하는 별도 요소
- 라벨 `white-space: nowrap` 유지 + 인덴트 축소로 한줄 표시
- 상위기준: 굵은 폰트 0.95rem / 하위기준: 연한 색 0.85rem
