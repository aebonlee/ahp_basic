# 평가 결과 세부내용 바 차트 레이아웃 수정

**작업일**: 2026-03-09

## 문제
- 세부내용(수준별 기준 중요도, 기준별 대안 중요도) 바 차트에서 **수치가 다음 줄로 넘어감**
- 수치(%)가 잘 안 보이고 가독성 부족

## 원인 분석
- `LevelResultView`와 `AlternativeResultView`가 `.barRow`(`display: contents`) 사용
- 하지만 부모가 `.resultBlock`으로 **CSS Grid가 아님** → `display: contents`가 의미 없음
- 결과: `<span>(라벨)` → `<div>(바 트랙, block)` → `<span>(수치)` 순서로 흘러, 수치가 다음 줄로 밀림

## 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/components/results/LevelResultView.jsx` | `.barList` grid 래퍼 추가 |
| `src/components/results/AlternativeResultView.jsx` | `.barList` grid 래퍼 추가 |
| `src/styles/results.module.css` | grid 컬럼 개선, 바/수치 가독성 향상 |
| `src/components/evaluation/PriorityBarChart.module.css` | 수치 min-width 증가, nowrap 추가 |

## CSS 변경 상세
| 속성 | 이전 | 이후 |
|------|------|------|
| `.barList` grid-template-columns | `auto 1fr auto` | `minmax(80px, auto) 1fr minmax(76px, auto)` |
| `.barList` gap | `5px var(--spacing-sm)` | `6px var(--spacing-md)` |
| `.barTrack` height | 20px | 24px |
| `.barValue` min-width | 64px | 76px |
| `.barValue` style | 텍스트만 | 배경+테두리 박스, `white-space: nowrap` |
| `.barValueTop` | 일반 강조 | primary 색상 + 배경 박스 |
| `.crBadge` | 텍스트만 | 배경+테두리 박스 |
| PriorityBarChart `.value` min-width | 64px | 72px + `nowrap` |

## 검증
- `npm run build` 성공
