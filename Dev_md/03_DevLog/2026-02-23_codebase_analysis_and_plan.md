# 코드베이스 분석 및 미완성 기능 개발 계획

> 작업일: 2026-02-23
> 상태: 진행중

---

## 1. 프로젝트 현황 분석

### 기술 스택
| 항목 | 기술 |
|------|------|
| Frontend | React 18 + Vite 5 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| 차트 | Recharts |
| 테스트 | Vitest + jsdom |
| 배포 | GitHub Pages (Actions) |

### 완성된 기능
| 기능 | 핵심 파일 |
|------|-----------|
| AHP 엔진 (고유벡터법) | `src/lib/ahpEngine.js` |
| 쌍대비교 평가 UI | `PairwiseRatingPage.jsx` |
| 관리자 대시보드 | `AdminDashboard.jsx` |
| 프로젝트/기준/대안 CRUD | Context + Hooks |
| 평가자 관리/초대 | `EvaluatorManagementPage.jsx` |
| 가중 기하평균 집계 | `ahpAggregation.js` |
| 종합 결과 차트 | `ComprehensiveChart.jsx` |
| 민감도 분석 엔진 | `sensitivityAnalysis.js` |
| 풍선도움말 시스템 | `HelpButton.jsx` + `helpData.js` |
| RLS 순환참조 수정 | `001_user_profiles.sql` |

### 미완성 기능 (버그/누락)
| 우선순위 | 기능 | 문제 |
|----------|------|------|
| CRITICAL | 직접입력 평가 | DB 테이블 미존재, 계산엔진 미구현 |
| HIGH | AdminResultPage 검증 | `allConsistent: true, allComplete: true` 하드코딩 |
| HIGH | WorkshopPage 진행률 | `max={100}` 하드코딩, 총 비교 수 미계산 |
| HIGH | ResourceAllocationPage | 기준 가중치 무시, 단순 합산 버그 |
| MEDIUM | SensitivityPage | 에러 핸들링 없음, 빈 데이터 크래시 가능 |
| MEDIUM | 도움말 누락 | 민감도/자원배분/워크숍 페이지 HelpButton 없음 |
| LOW | 테스트 | 엔진 테스트만 존재, UI/집계 테스트 없음 |
| LOW | CI/CD | 배포 시 테스트 미실행 |

---

## 2. 구현 계획

### Phase 1: 직접입력 평가 완성
- `direct_input_values` 테이블 생성 (마이그레이션 SQL)
- `directInputEngine.js` 계산 엔진 (정규화, CR=0)
- `DirectInputPanel.jsx` 검증 강화
- `DirectInputPage.jsx` 실시간 시각화
- `EvaluationContext.jsx` 직접입력 상태 관리
- `AdminResultPage.jsx` 직접입력 통합

### Phase 2: AdminResultPage 검증 로직
- 하드코딩 제거, 실제 완료/일관성 검증

### Phase 3: WorkshopPage 진행률
- 총 필요 비교 수 계산, 정확한 진행률 표시

### Phase 4: ResourceAllocationPage 공식 수정
- `getCriteriaGlobal` 함수 도입, 계층 가중치 반영

### Phase 5: SensitivityPage 안전성 강화
- try-catch 래핑, 빈 데이터 처리

### Phase 6: 도움말 추가
- `helpData.js`에 3개 키 추가
- 3개 페이지에 HelpButton 배치

### Phase 7: 테스트 보강
- directInputEngine, ahpAggregation, sensitivityAnalysis 테스트

### Phase 8: CI/CD 테스트 단계
- `deploy.yml`에 `npm run test` 추가

---

## 3. 커밋 전략

| Phase | 커밋 메시지 |
|-------|------------|
| 1 | `feat: 직접입력 평가 기능 완성 (DB + 엔진 + UI)` |
| 2 | `fix: AdminResultPage 평가 완료/일관성 검증 로직 구현` |
| 3 | `fix: WorkshopPage 진행률 계산 정확도 개선` |
| 4 | `fix: ResourceAllocationPage 계층 가중치 반영 공식 수정` |
| 5 | `fix: SensitivityPage 에러 핸들링 및 안전성 강화` |
| 6 | `feat: 민감도/자원배분/워크숍 페이지 도움말 추가` |
| 7 | `test: 집계/직접입력/민감도 엔진 테스트 추가` |
| 8 | `ci: 배포 파이프라인에 테스트 단계 추가` |
