# 개발일지 - 2026-02-22 소스 분석 완료 및 개발 계획 수립

## 작업 요약
I Make It (imakeit.kr) AHP 서비스의 웹 소스 수집 및 분석을 완료하였다.
총 9개 페이지를 분석하여 서비스 전체 흐름을 파악하고, 약 85%의 커버리지를 달성했다.

---

## 1. 수집/분석된 페이지 목록

| # | 페이지 | 소스 유형 | 핵심 기능 |
|---|--------|----------|----------|
| 1 | 관리자 메인 (default.aspx) | HTML + 분석 | 프로젝트 목록, 상태별 필터링, 모드 전환 |
| 2 | 모델구축 (default.aspx?id=3946) | HTML + 분석 | 계층 트리 에디터, 기준/대안 CRUD, drag&drop |
| 3 | 브레인스토밍 (default.aspx?key=brain) | HTML + 분석 | 키워드 입력, 카테고리 분류, 투표 시스템 |
| 4 | 모델확정 (data-state=6) | 분석만 | 확정 다이얼로그, 평가시작 선택(웹/워크숍) |
| 5 | 평가시작 (상태전환) | 분석만 | 대기중(6) → 평가중(1) 상태 전환 |
| 6 | 평가자 메인 (평가방법소개) | 분석만 | AHP 설명, 17점 척도, 평가방법 선택 |
| 7 | 쌍대비교 평가 (1차/2차 기준) | HTML + 분석 + 비주얼 렌더 | 매트릭스 UI, 실시간 저장, CR 검증, 그래프 |
| 8 | 평가 UI 목업 (사용자 제작) | HTML + 분석 | 모던 카드 UI, 판단 도우미, 진행 상태 |
| 9 | 평가결과 (default.aspx?key=result) | 분석만 | 종합중요도, 비일관성비율, Excel 저장, 평가 완료 |

---

## 2. 파악된 서비스 전체 흐름

```
[관리자 MODE]
  로그인 → 메인(프로젝트 목록)
    → 신규 프로젝트 생성 (생성중, state=2)
    → 브레인스토밍 (선택적)
    → 모델구축 (계층 트리 편집)
    → 모델확정 (대기중, state=6)
    → 평가시작 (평가중, state=1)
    → (평가자들 평가 진행)
    → 관리자 결과 확인/집계

[평가자 MODE]
  로그인 → 평가방법 소개
    → 1차 기준 쌍대비교 (N×N 매트릭스)
    → 2차 기준 쌍대비교 (하위 기준별)
    → 대안 쌍대비교 (기준별)
    → 평가결과 확인 (종합중요도, CR, Excel)
    → 평가 완료 (서명)
```

---

## 3. 발견된 핵심 데이터 구조

### 3.1 예제 계층 구조 (대학원생의 연구역량)
```
대학원생의 연구역량 (Goal)
├─ 창의력 (17.503%, ID:80948)
│  ├─ 자료 검색 (3.501%, ID:80952)
│  └─ 사고력 (14.003%, ID:80953)
├─ 분석능력 (17.503%, ID:80949)
│  ├─ 데이터 분석 (14.586%, ID:80954)
│  └─ 수치 분석 (2.917%, ID:80955)
├─ 기술능력 (24.07%, ID:80950)
│  ├─ 도구 사용 (2.407%, ID:80956)
│  └─ 컴퓨터 활용 (21.663%, ID:80957)
└─ 문제 해결능력 (40.923%, ID:80951)
   ├─ 알고리즘 수립 (4.547%, ID:80958)
   └─ 알고리즘 평가 (36.376%, ID:80959)
```

### 3.2 평가 데이터 (비주얼 렌더에서 추출)

| 비교 그룹 | 항목 A | 항목 B | 결과 A | 결과 B | 선택 |
|-----------|--------|--------|--------|--------|------|
| 창의력 하위 | 자료 검색 | 사고력 | 20% | 80% | 사고력이 상당히(4) 더 중요 |
| 분석능력 하위 | 데이터 분석 | 수치 분석 | 83.333% | 16.667% | 데이터 분석이 많이(5) 더 중요 |
| 기술능력 하위 | 도구 사용 | 컴퓨터 활용 | 10% | 90% | (추정) |
| 문제해결능력 하위 | 알고리즘 수립 | 알고리즘 평가 | 11.111% | 88.889% | (추정) |

- **비일관성비율(CR)**: 0.05787 (1차 기준, 통과 ≤ 0.1)
- 2개 하위기준 그룹은 CR 계산 불필요

### 3.3 핵심 API 매핑

| 원본 API | 용도 | React 구현 방향 |
|----------|------|----------------|
| makeit.asmx/load_model | 모델 트리 로드 | Supabase query |
| makeit.asmx/check_manager | 관리자 권한 확인 | Supabase RLS |
| pm_ajax.asmx/save_brain | 브레인스토밍 저장 | Supabase mutation |
| par_ajax.asmx/btn_save_ssang | 쌍대비교 저장 | Supabase Edge Function |
| par_ajax.asmx/btn_save_direct | 직접입력 저장 | Supabase Edge Function |
| par_ajax.asmx/last_cell | 마지막 셀 처리 | Supabase Edge Function |
| par_ajax.asmx/last_alt_save | 대안 마지막 저장 | Supabase Edge Function |
| par_ajax.asmx/par_result | 결과 조회 (type 1/2/3) | Supabase query |

### 3.4 AHP 17점 척도

| 값 | 한국어 | 의미 |
|----|--------|------|
| 9 | 극히많이 | Extreme importance |
| 8 | 대단히많이 | Very strong to extreme |
| 7 | 아주많이 | Very strong importance |
| 6 | 매우많이 | Strong to very strong |
| 5 | 많이 | Strong importance |
| 4 | 상당히 | Moderate to strong |
| 3 | 약간 | Moderate importance |
| 2 | 조금 | Equal to moderate |
| 1 | 동등 | Equal importance |

좌우 대칭으로 총 17칸 (9-8-7-6-5-4-3-2-1-2-3-4-5-6-7-8-9)

### 3.5 평가 방법

| 코드 | 이름 | 설명 |
|------|------|------|
| 10 | 쌍대비교-이론 | 전체 상삼각 매트릭스 입력 (기본) |
| 12 | 쌍대비교-실용 | 최소 비교만 (n-1개, 기본값) |
| 20 | 직접입력 | 각 기준에 직접 점수 부여 |

---

## 4. 커버리지 분석 (~85%)

### 확보 완료 (✅)
- [x] 관리자 메인 페이지 (프로젝트 목록/관리)
- [x] 모델구축 페이지 (트리 에디터, CRUD)
- [x] 브레인스토밍 페이지 (키워드, 투표)
- [x] 모델확정/평가시작 흐름
- [x] 평가자 메인 (방법 소개)
- [x] 1차 기준 쌍대비교 평가 (4기준, 6쌍)
- [x] 2차 기준 쌍대비교 평가 (하위 기준)
- [x] 평가결과 페이지 (종합, CR, Excel, 완료)
- [x] 평가 UI 목업 (디자인 참고)
- [x] CSS 패턴 (비주얼 렌더 추출)
- [x] AHP 알고리즘 로직 (JS 코드 분석)

### 미확보/추가 필요 (❌)

| 항목 | 우선순위 | 설명 |
|------|---------|------|
| imakeit.css | 높음 | 전역 스타일시트 (클래스 기반 스타일 파악 필요) |
| lan.js | 중간 | 다국어 번역 데이터 (한국어 우선이면 낮은 우선순위) |
| 대안 쌍대비교 (rating_alt_sub.aspx) | 높음 | 기준별 대안 비교 페이지 (JS에서 참조 확인됨) |
| 관리자 결과 집계 | 중간 | 다수 평가자 결과 종합 (관리자 MODE) |
| workshop.aspx | 낮음 | 워크숍 모드 (웹 평가 우선 개발) |
| 회원가입/로그인 | 낮음 | Supabase Auth로 자체 구현 예정 |
| 프로젝트 생성 | 중간 | 신규 프로젝트 생성 폼 (모델구축 전 단계) |

---

## 5. 개발 계획 (5단계)

### Phase 1: 프로젝트 초기화 및 DB 설계
- React 18 + Vite 프로젝트 생성
- Supabase 프로젝트 연결
- DB 스키마 설계:
  - `projects` (프로젝트 메타, 상태)
  - `criteria` (기준 트리 - 재귀적 parent_id)
  - `alternatives` (대안)
  - `evaluators` (평가자)
  - `pairwise_comparisons` (쌍대비교 결과)
  - `evaluation_results` (계산된 중요도)
- Supabase Auth 설정 (관리자/평가자 역할)
- RLS 정책 설정

### Phase 2: 관리자 기능
- 메인 대시보드 (프로젝트 목록, 상태 필터)
- 모델구축 (계층 트리 에디터)
  - 트리 CRUD (추가/수정/삭제/이동)
  - Google OrgChart → React 트리 컴포넌트
  - drag&drop 정렬
- 브레인스토밍 (선택적)
  - 키워드 입력, 카테고리, 투표
- 모델확정 → 평가시작 상태 전환

### Phase 3: 평가자 기능 (핵심)
- 평가 방법 소개 페이지
- **쌍대비교 매트릭스 UI** (가장 복잡한 컴포넌트)
  - 17칸 그라데이션 셀 (파랑-회색-빨강)
  - 선택/해제 인터랙션
  - 실시간 중요도 바 차트
  - 페이지 네비게이션 (이전/다음)
  - 진행도 표시
- **AHP 계산 엔진**
  - 고유벡터법 (Power Method)
  - 일관성비율(CR) 검증
  - Best-fit 추천 (bestfiter/makeBestFit)
- 직접입력 모드 (대체 평가 방법)
- 대안 쌍대비교

### Phase 4: 평가 결과
- 기준 종합중요도 차트 (레벨별 색상)
- 비일관성비율 테이블 (CR > 0.1 경고)
- 세부 결과 (수준별 기준, 기준별 대안)
- 평가 완료 처리 (서명)
- Excel/Word 다운로드 (xlsx 라이브러리)

### Phase 5: 관리자 집계 및 고도화
- 다수 평가자 결과 종합
- 그룹 의사결정 집계
- 반응형 디자인 최적화 (모바일/데스크탑)
- 다국어 지원 (선택적)
- 성능 최적화

---

## 6. 기술 스택 확정

| 구분 | 기술 | 용도 |
|------|------|------|
| Frontend | React 18 + Vite | SPA 프레임워크 |
| Routing | React Router DOM 6 | 페이지 라우팅 |
| State | Context API + useReducer | 전역 상태 관리 |
| DB/Auth | Supabase | PostgreSQL + Auth + RLS |
| AHP 계산 | 자체 구현 (JS) | 고유벡터, CR, Best-fit |
| 차트 | recharts | 바 차트, 종합중요도 |
| 트리 | React 트리 컴포넌트 | 계층 구조 표시 |
| Excel | xlsx + file-saver | 결과 다운로드 |
| 스타일 | CSS Modules / CSS3 | www 리포 디자인 기반 |
| 배포 | Vercel / GitHub Pages | 정적 호스팅 |

---

## 7. copy_code/ 파일 현황

```
copy_code/
├── README.md (목록 인덱스)
├── 2026-02-22_imakeit_default_page/
│   ├── default.aspx.html          ← HTML 원본
│   └── source_analysis.md         ← 분석 메모
├── 2026-02-22_imakeit_model_builder/
│   ├── model_builder.aspx.html    ← HTML 원본
│   ├── source_analysis.md         ← 분석 메모
│   └── model_builder_full_analysis.md ← 상세 분석
├── 2026-02-22_imakeit_brainstorming/
│   ├── brainstorming.aspx.html    ← HTML 원본
│   ├── source_analysis.md         ← 분석 메모
│   └── brainstorming_usage_guide.md ← 사용 가이드
├── 2026-02-22_imakeit_model_confirm/
│   └── source_analysis.md         ← 분석만 (HTML 미저장)
├── 2026-02-22_imakeit_eval_start/
│   └── source_analysis.md         ← 분석만 (HTML 미저장)
├── 2026-02-22_imakeit_evaluator_main/
│   └── source_analysis.md         ← 분석만 (HTML 미저장)
├── 2026-02-22_imakeit_pairwise_rating/
│   ├── pairwise_subcriteria.aspx.html ← 2차 기준 HTML 원본
│   ├── source_analysis.md         ← 1차 기준 분석
│   └── visual_render_analysis.md  ← CSS/비주얼 패턴
├── 2026-02-22_imakeit_eval_mockup/
│   ├── eval_mockup.aspx.html      ← 목업 HTML
│   └── source_analysis.md         ← 분석 메모
└── 2026-02-22_imakeit_eval_result/
    └── source_analysis.md         ← 분석만 (HTML 미저장)
```

---

## 8. 이슈 및 메모

### 미저장 HTML 원본
아래 페이지들은 분석 메모만 작성되었고 HTML 원본은 아직 저장되지 않음:
- 모델확정 페이지
- 평가시작 페이지
- 평가자 메인 페이지
- 1차 기준 쌍대비교 (4기준 버전)
- 평가결과 페이지
- 비주얼 렌더 CSS/HTML 원본들

### 핵심 발견 사항
1. **쌍대비교 저장 API 응답**: `{pri: [priorities], cr: CR, best: [{best_index, best_value, best_cr}]}`
   - 서버에서 AHP 계산을 수행하여 결과를 즉시 반환
   - React 버전에서는 클라이언트 또는 Edge Function에서 계산 필요
2. **Best-fit 알고리즘**: 비일관성이 높을 때 추천 셀 값을 계산하여 안내
   - `bestfiter()` → `makeBestFit()` → 추천 버튼 1~5
3. **다국어 시스템**: `<dsdata class='lang' data-id='XX'>` + `lan.js` + `lang_out(code)`
   - 초기 한국어 전용으로 개발 후 추후 확장 가능
4. **프로젝트 상태 코드**: 생성중(2) → 대기중(6) → 평가중(1)
5. **평가 완료 조건**: 모든 셀 완료 + 모든 CR < 0.1

---

## 다음 단계
- [ ] 추가 소스 수령 시 HTML 원본 저장 (특히 대안 쌍대비교 rating_alt_sub.aspx)
- [ ] Phase 1 착수: React + Vite 초기화, Supabase DB 스키마 설계
- [ ] AHP 계산 로직 독립 모듈로 선(先) 구현 및 테스트
- [ ] www 리포 디자인 시스템을 기반으로 UI 컴포넌트 라이브러리 구축
