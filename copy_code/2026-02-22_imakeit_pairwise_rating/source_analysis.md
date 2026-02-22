# 쌍대비교 평가(Pairwise Rating) 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?id=3946 (평가자 MODE)
- **역할**: 실제 쌍대비교 평가 수행 페이지

## 핵심 데이터 구조

### 인라인 기준 트리 데이터
```javascript
var data = '[
  {"Node":"대학원생의 연구역량","Parent":"","Tooltip":""},
  {"Node":"창의력","Parent":"대학원생의 연구역량","Tooltip":"","id":"80948"},
  {"Node":"분석능력","Parent":"대학원생의 연구역량","Tooltip":"","id":"80949"},
  {"Node":"기술능력","Parent":"대학원생의 연구역량","Tooltip":"","id":"80950"},
  {"Node":"문제 해결능력","Parent":"대학원생의 연구역량","Tooltip":"","id":"80951"}
]';
```

### 쌍대비교 매트릭스 (4개 기준 → 6쌍)
| 비교 | cri_st | cri_nd | row | col |
|------|--------|--------|-----|-----|
| 창의력 vs 분석능력 | 80948 | 80949 | 0 | 1 |
| 창의력 vs 기술능력 | 80948 | 80950 | 0 | 2 |
| 창의력 vs 문제해결능력 | 80948 | 80951 | 0 | 3 |
| 분석능력 vs 기술능력 | 80949 | 80950 | 1 | 2 |
| 분석능력 vs 문제해결능력 | 80949 | 80951 | 1 | 3 |
| 기술능력 vs 문제해결능력 | 80950 | 80951 | 2 | 3 |

### 평가값 범위
- **-9 ~ 9**: 음수 = 왼쪽 기준 우세, 양수 = 오른쪽 기준 우세, 0 = 미평가

## UI 구성

### 평가 그리드
- 각 행: [왼쪽 기준명] [9칸 왼쪽] [동등] [9칸 오른쪽] [오른쪽 기준명]
- 셀 클릭 → 즉시 AJAX 저장 → 중요도/CR 실시간 업데이트
- 선택된 셀: 배경색 변경으로 표시

### 중요도 결과 바
- 각 기준별 중요도 퍼센트 바 그래프
- 실시간 업데이트 (draw_graph 함수)

### 판단 도우미 (Best Fit)
- CR > 0.1일 때 활성화
- 가장 큰 개선 효과 순으로 추천 셀 표시
- 추천 셀 깜빡임 애니메이션

### 페이지 네비게이션
- "1/6" 형식으로 현재 비교 위치 표시
- 6문항 모두 완료 시 평가 완료 처리

## 실시간 저장 흐름
```
셀 클릭 → btn_ajax_ssang()
  → par_ajax.asmx/btn_save_ssang (POST)
  → { cri_st, cri_nd, row, col, val }
  → 응답: { pri: [15.3, 32.1, 20.6, 32.0], cr: 1.35, best: [...] }
  → draw_graph() 업데이트
  → cr_check() CR 검증
```

## React 변환 시 주요 매핑
| 원본 | React 구현 |
|------|-----------|
| 셀 그리드 테이블 | PairwiseGrid 컴포넌트 |
| btn_ajax_ssang AJAX | Supabase Edge Function + useMutation |
| draw_graph 바 차트 | PriorityChart 컴포넌트 (recharts) |
| bestfiter 깜빡임 | CSS animation + state |
| 페이지 네비게이션 | React Router 또는 state 기반 |
