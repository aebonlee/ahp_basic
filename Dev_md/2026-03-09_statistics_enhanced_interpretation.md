# 통계 분석 기능 강화 — 상세 해석 & 친절한 안내

**날짜:** 2026-03-09
**작업 유형:** 기능 강화 (Enhancement)

## 변경 개요

SPSS 수준의 학술 분석 도구로 강화하기 위해, 10개 통계분석의 결과 해석을 풍부하게 하고 사용자 친화적 안내를 대폭 추가.

## 수정 파일

### 1. `src/lib/statsEngine.js` — 엔진 확장
- **기술통계**: 사분위수(Q1, Q3, IQR), 표준오차(SE), 95% 신뢰구간(CI), 정규성 판단(왜도 ±2, 첨도 ±7)
- **독립표본 T검정**: 평균 차이의 95% CI, Levene 등분산 근사 검정, 분산 비율
- **대응표본 T검정**: Cohen's d 추가, 차이의 95% CI
- **ANOVA**: 그룹별 최솟값/최댓값, η² 효과크기 해석 라벨
- **카이제곱**: 기대빈도 5 미만 셀 수 경고 플래그, Cramér's V 해석 라벨
- **상관분석**: 결정계수(r²), 다중공선성 경고(r > 0.9 쌍 감지)
- **Spearman**: 결정계수(ρ²) 추가
- **단순선형회귀**: Adjusted R², F통계량, Durbin-Watson 근사값 및 해석
- **크론바흐 알파**: 삭제 권고 항목 자동 감지, 항목-총점 상관 0.3 미만 항목 경고
- **교차분석**: 표준화 잔차(adjusted residual), 유의 셀 감지, 열 비율표, 기대빈도 경고

### 2. `src/components/statistics/ResultRenderers.jsx` — 렌더러 강화
- **공통 컴포넌트 신규**:
  - `AnalysisGuideBox`: 접이식(details/summary) 분석 안내 — 목적/사용 상황/가정/팁
  - `InterpretSection`: 아이콘 + 텍스트 구조화 해석 리스트
  - `SampleSizeWarning`: N < 30 경고 박스
- **10개 분석 렌더러 모두 강화**:
  - 각 분석에 AnalysisGuideBox 추가
  - 단순 한 줄 해석 → 구조화된 다항목 해석(InterpretSection)
  - 추가 통계량(CI, r², 효과크기 상세) 표시
  - 상관분석에 강도 해석 기준 테이블 추가
  - 회귀분석에 가정 체크리스트 추가
  - 크론바흐에 삭제 권고/저상관 항목 경고
  - 교차분석에 표준화 잔차 테이블 및 유의 셀 테이블

### 3. `src/components/statistics/ResultRenderers.module.css` — 스타일 추가
- `.guideBox`: 접이식 안내 박스 (연보라 배경)
- `.interpretSection` / `.interpretList` / `.interpretItem`: 구조화 해석
- `.assumptionList` / `.assumptionItem`: 가정 체크리스트
- `.sampleWarn`: 표본 크기 경고

### 4. `src/components/statistics/VariableSelector.jsx` — 안내 문구 추가
- ANALYSIS_CONFIG에 `help` 필드 추가 (10개 분석 모두)
- 변수 선택 전 안내 문구 표시 (연보라 배경 박스)
- VariableSelector.module.css에 `.helpText` 스타일 추가

### 5. `src/pages/StatisticalAnalysisPage.jsx` — 가이드 강화
- 기존 6개 섹션 → 10개 섹션으로 확장
- **신규 섹션**:
  - 변수 유형별 분석 선택 흐름도 (텍스트 기반)
  - 각 분석의 가정(Assumptions) 테이블
  - 결과 보고 양식 (학술 논문 기준)
  - FAQ (자주 묻는 질문 5개, 접이식)
- StatisticalAnalysisPage.module.css에 `.flowChart`, `.faqList`, `.faqItem` 스타일 추가

## 검증
- `npm run build` 성공
- 모든 분석 렌더러에 안내 박스 + 상세 해석 표시
- 접이식(details/summary) 동작 확인
- 표본 크기 경고 N < 30일 때 표시
- 가이드 페이지 10개 섹션 정상 렌더링
