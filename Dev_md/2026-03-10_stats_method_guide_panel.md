# 통계 분석 방법별 가이드 패널 추가

## 날짜
2026-03-10

## 개요
통계 분석 페이지에서 분석 방법을 선택하면, 변수 선택 UI 왼쪽에 해당 분석 방법의
상세 가이드 박스를 표시하여 연구자가 어떤 변수를 선택해야 하는지 쉽게 이해할 수 있도록 했다.

## 원인

### 증상
- 통계 방법 선택 후 변수 선택 화면에서 어떤 변수를 넣어야 하는지 이해하기 어려움
- 기존에는 한 줄 help 텍스트만 표시 ("선택한 변수의 평균, 표준편차..." 등)
- 분석 방법의 목적, 가정 사항, 결과 해석 방법 등이 없음

## 수정 내용

### `src/pages/StatisticalAnalysisPage.jsx`

1. **`METHOD_GUIDE` 객체 추가** — 10개 분석 방법별 상세 가이드 데이터:
   - `what`: 이 분석은 무엇인가?
   - `when`: 언제 사용하는가?
   - `variables`: 필요한 변수 유형과 설명
   - `assumptions`: 통계적 가정 사항
   - `output`: 분석 결과 항목 목록
   - `report`: 논문 보고 형식 (APA 스타일)
   - `example`: 사용 예시
   - `tip`: 실용적 팁

2. **`MethodGuideBox` 컴포넌트 추가** — 왼쪽 패널 렌더링:
   - 각 가이드 섹션을 시각적으로 구분하여 표시
   - TIP 박스 (노란색 배경)
   - "전체 통계 가이드 보기" 링크 버튼

3. **config 단계 2열 레이아웃** — `configLayout` 그리드:
   - 왼쪽 (340px): `MethodGuideBox` (sticky, 스크롤 시 고정)
   - 오른쪽 (1fr): `VariableSelector` (기존 변수 선택 UI)

### `src/pages/StatisticalAnalysisPage.module.css`

1. **`.configLayout`** — CSS Grid 2열 (`340px 1fr`)
2. **`.methodGuide`** — 가이드 박스 카드 스타일 (`sticky`, 상단 고정)
3. **`.mgTitle` ~ `.mgGuideLink`** — 각 섹션별 스타일:
   - `.mgLabel`: 섹션 라벨 (UPPERCASE, 작은 크기)
   - `.mgVarList`: 변수 목록 (▶ 아이콘)
   - `.mgOutputList`: 결과 항목 (✓ 체크 아이콘)
   - `.mgCode`: 논문 보고 형식 (모노스페이스 코드)
   - `.mgTip`: 팁 박스 (노란색 배경)
   - `.mgGuideLink`: 전체 가이드 링크 버튼
4. **반응형 (900px 이하)**: 1열 세로 배치, sticky 해제

### `src/components/statistics/VariableSelector.module.css`

- `.container`의 `max-width: 600px; margin: 0 auto` 제거 → 2열 레이아웃에서 유연하게 확장

## 레이아웃 구조

```
┌──────────────────────────────────────────────────┐
│  통계 분석                                        │
│  응답자: 30명  수치 변수: 8개  범주 변수: 3개      │
├─────────────────────┬────────────────────────────┤
│  [분석 방법 가이드]  │  [변수 선택 영역]           │
│                     │                            │
│  이 분석은?          │  ← 돌아가기                │
│  언제 사용?          │  독립표본 T검정             │
│  필요한 변수         │  두 독립 집단의 평균...     │
│   ▶ 그룹 변수 — 범주형│                           │
│   ▶ 검정 변수 — 수치형│  그룹 변수: [dropdown]     │
│  가정 사항           │  검정 변수: [dropdown]      │
│  분석 결과 항목      │                            │
│   ✓ t값, df, p값     │  [분석 실행]               │
│   ✓ Cohen's d       │                            │
│  논문 보고 형식      │                            │
│  TIP: ...           │                            │
│  📖 전체 가이드 보기  │                            │
└─────────────────────┴────────────────────────────┘
```

## 영향 범위
- 통계 분석 페이지(`/admin/project/:id/statistics`)의 변수 선택 단계(config)
- 기존 통계 가이드 페이지는 그대로 유지 (가이드 박스에서 링크로 접근 가능)
- 모바일에서는 가이드 박스가 위, 변수 선택이 아래로 세로 배치

## 수정 파일
- `src/pages/StatisticalAnalysisPage.jsx` — METHOD_GUIDE + MethodGuideBox + 2열 레이아웃
- `src/pages/StatisticalAnalysisPage.module.css` — 레이아웃 + 가이드 박스 스타일
- `src/components/statistics/VariableSelector.module.css` — max-width 제거
