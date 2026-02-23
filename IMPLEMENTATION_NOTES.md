# 개발일지

---

## 2026-02-23 (2차) — 프로젝트 사이드바 네비게이션 추가

### 변경 요약
관리자 프로젝트 페이지 8개에 왼쪽 사이드바 메뉴를 추가하여 단계별 이동을 직관적으로 제공.

### 신규 파일 (4개)
| 파일 | 역할 |
|------|------|
| `src/components/layout/ProjectSidebar.jsx` | 8단계 메뉴 사이드바 (번호 표시, 현재 단계 하이라이트) |
| `src/components/layout/ProjectSidebar.module.css` | 사이드바 스타일 (데스크톱: 좌측 200px, 모바일: 상단 가로 스크롤) |
| `src/components/layout/ProjectLayout.jsx` | Navbar + Sidebar + Content 래퍼 |
| `src/components/layout/ProjectLayout.module.css` | flex 레이아웃 (sidebar + content) |

### 수정 파일 (10개)
| 파일 | 변경 내용 |
|------|-----------|
| `ModelBuilderPage.jsx` | PageLayout → ProjectLayout, 뒤로가기/중복 네비 버튼 제거 |
| `BrainstormingPage.jsx` | PageLayout → ProjectLayout, topBar 제거 |
| `ModelConfirmPage.jsx` | PageLayout → ProjectLayout, topBar 제거 |
| `EvaluatorManagementPage.jsx` | PageLayout → ProjectLayout, topBar/모델확정 버튼 제거 |
| `AdminResultPage.jsx` | PageLayout → ProjectLayout |
| `SensitivityPage.jsx` | PageLayout → ProjectLayout |
| `ResourceAllocationPage.jsx` | PageLayout → ProjectLayout |
| `WorkshopPage.jsx` | PageLayout → ProjectLayout |
| `ModelConfirmPage.module.css` | .topBar 제거 |
| `EvaluatorManagementPage.module.css` | .topBar 제거 |

### 사이드바 8단계 메뉴
| 번호 | 라벨 | 경로 |
|------|------|------|
| 1 | 모델 구축 | `/admin/project/:id` |
| 2 | 브레인스토밍 | `/admin/project/:id/brain` |
| 3 | 모델 확정 | `/admin/project/:id/confirm` |
| 4 | 평가자 관리 | `/admin/project/:id/eval` |
| 5 | 실시간 워크숍 | `/admin/project/:id/workshop` |
| 6 | 집계 결과 | `/admin/project/:id/result` |
| 7 | 민감도 분석 | `/admin/project/:id/sensitivity` |
| 8 | 자원 배분 | `/admin/project/:id/resource` |

### 검증
- `npm run build` — 빌드 성공
- `npm run test` — 38개 테스트 전체 통과
- App.jsx 라우트와 사이드바 경로 8개 모두 일치 확인

---

## 2026-02-23 (1차) — 모델 구축 페이지 시각적 계층 캔버스 전환

### 변경 요약
2컬럼 리스트 트리를 imakeit.kr 스타일의 계층 다이어그램(목적→기준→대안)으로 교체.

### 신규 파일 (5개)
| 파일 | 역할 |
|------|------|
| `src/lib/hierarchyLayout.js` | 트리 레이아웃 알고리즘 (bottom-up 너비 → top-down 중앙 정렬) |
| `src/components/model/CanvasNode.jsx` | 노드 타입별 렌더링 (goal/criteria/alternative) + 호버 액션 |
| `src/components/model/CanvasNode.module.css` | 목적(파란), 기준(흰+레벨색), 대안(둥근 녹색) 스타일 |
| `src/components/model/HierarchyCanvas.jsx` | SVG Bezier 연결선 + 우클릭 컨텍스트 메뉴 + 빈 상태 UI |
| `src/components/model/HierarchyCanvas.module.css` | 캔버스/연결선/점선 구분/컨텍스트 메뉴 스타일 |

### 수정 파일 (2개)
| 파일 | 변경 내용 |
|------|-----------|
| `src/pages/ModelBuilderPage.jsx` | CriteriaTree/AlternativeTree → HierarchyCanvas |
| `src/pages/ModelBuilderPage.module.css` | 2컬럼 그리드 제거, canvasToolbar/canvasContainer 추가 |

### 레이아웃 상수
- NODE_WIDTH=140, NODE_HEIGHT=48, LEVEL_GAP=80, NODE_GAP=24, PADDING=40

### 검증
- `npm run build` — 빌드 성공
- `npm run test` — 38개 테스트 전체 통과
