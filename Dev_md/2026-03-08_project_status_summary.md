# AHP Basic 프로젝트 현황 요약 — 2026-03-08

## 현재 프로젝트 상태

### 종합 평가
| 구분 | 수치 |
|------|------|
| **종합 점수** | **v4 = 7.80/10** (A- 89점) |
| **빌드** | 1089 modules / 10.57s |
| **테스트** | 121/121 전원 통과 |
| **커밋** | 158회 |
| **코드량** | ~15,000-18,000 LOC |
| **배포** | GitHub Actions 자동 배포 (main push) |
| **도메인** | https://ahp-basic.dreamitbiz.com |

---

## 대분류별 점수 (v4)

| 항목 | 점수 | 가중치 | 가중 점수 | 비고 |
|------|------|--------|-----------|------|
| 성능 & 번들 | **9.0** | 15% | 1.35 | manualChunks 3개 vendor 분리 완료 |
| 코드 품질 | **8.5** | 20% | 1.70 | ErrorBoundary + try-catch + Toast |
| SEO & 메타데이터 | **8.0** | 10% | 0.80 | canonical, robots, sitemap, 404 완비 |
| 보안 | **8.0** | 15% | 1.20 | CSP, PKCE, RLS 완비 |
| UX & 컴포넌트 구조 | **8.0** | 5% | 0.40 | 도메인별 컴포넌트 구조 |
| 접근성 | **7.0** | 15% | 1.05 | Modal focus trap, PairwiseCell 키보드 잔존 |
| CSS 토큰 일관성 | **7.0** | 10% | 0.70 | 브랜드색 100% 완료, 구조색 ~200곳 잔존 |
| 테스트 & 문서화 | **6.0** | 10% | 0.60 | UI 테스트 없음, README 미흡 |
| **종합** | | **100%** | **7.80 / 10** | |

---

## 기능 완성도

| # | 기능 | 달성률 | 비고 |
|---|------|--------|------|
| 1 | AHP 쌍대비교 | 100% | 완료 |
| 2 | AHP 결과 계산 (CR 포함) | 100% | 완료 |
| 3 | 다중 평가자 집계 | 100% | 가중 기하평균 |
| 4 | 직접 입력 방식 | 100% | 완료 |
| 5 | 로그인/회원가입 (Email+OAuth) | 100% | Google, Kakao |
| 6 | 관리자 대시보드 | 100% | 완료 |
| 7 | 모델 빌더 (기준/대안 계층) | 100% | 완료 |
| 8 | 브레인스토밍 | 100% | 완료 |
| 9 | 평가자 관리/초대 | 100% | 익명 초대 포함 |
| 10 | 결과 시각화 | 100% | Recharts |
| 11 | 민감도 분석 | 100% | What-if |
| 12 | 통계 분석 | 100% | 분포, 평균, 편차 |
| 13 | Excel/PDF 내보내기 | 100% | XLSX + FileSaver |
| 14 | 사전 설문 | 100% | 완료 |
| 15 | SuperAdmin 관리 | 100% | RPC 함수 |
| 16 | 반응형 디자인 | 90% | 모바일 부분 최적화 |
| 17 | 자원 배분 | 100% | 완료 |
| 18 | 워크숍 모드 | 100% | 완료 |
| 19 | CI/CD 자동 배포 | 100% | GitHub Actions |
| 20 | README 문서 | 10% | 제목만 존재 |

---

## 소스코드 규모

| 분류 | 수량 |
|------|------|
| 페이지 컴포넌트 | 30개 |
| UI 컴포넌트 | 70+ |
| 커스텀 Hooks | 14개 |
| 핵심 라이브러리 (lib/) | 17개 |
| 유틸리티 (utils/) | 4개 |
| 컨텍스트 | 4개 (Auth, Project, Evaluation, Toast) |
| 테스트 파일 | 9개 |
| CSS 모듈 | 75+ |
| DB 마이그레이션 | 12개 |
| 개발 문서 | 60+ |

---

## 스택 & 인프라

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite 5 |
| 라우팅 | HashRouter (GitHub Pages SPA 호환) |
| 백엔드 | Supabase (Auth + DB + RLS) |
| 인증 | Email, Google, Kakao (PKCE) |
| 차트 | Recharts |
| 내보내기 | XLSX + FileSaver |
| QR 코드 | qrcode.react |
| 테스트 | Vitest + React Testing Library |
| 배포 | GitHub Actions → GitHub Pages |
| 도메인 | ahp-basic.dreamitbiz.com (CNAME) |

---

## 잔존 개선 과제 (v5 목표: 8.3+)

### 중기 개선 (Medium Impact)
1. Modal focus trap 구현 — 접근성 +0.3
2. PairwiseCell 키보드 지원 — 접근성 +0.3
3. 구조색 CSS 토큰화 (~200곳) — CSS +0.5
4. JSON-LD 구조화 데이터 — SEO +0.3

### 장기 개선 (Lower Impact, High Effort)
5. 다크모드 ~70개 파일 override
6. 컴포넌트/페이지 테스트 추가 — 테스트 +2.0
7. React Helmet 도입 — 동적 SEO +0.5
8. README.md 확장

---

## 주요 파일 경로

| 역할 | 경로 |
|------|------|
| 앱 진입점 | `src/main.jsx` |
| 라우터 | `src/App.jsx` |
| 인증 | `src/contexts/AuthContext.jsx`, `src/utils/auth.js` |
| Supabase | `src/lib/supabaseClient.js` |
| AHP 엔진 | `src/lib/ahpEngine.js` |
| AHP 집계 | `src/lib/ahpAggregation.js` |
| 민감도 분석 | `src/lib/sensitivityAnalysis.js` |
| 통계 엔진 | `src/lib/statsEngine.js` |
| CSS 변수 | `src/styles/variables.css` |
| CI/CD | `.github/workflows/deploy.yml` |
| 환경변수 | `.env` (gitignore) |

---

*작성일: 2026-03-08*
*이전 버전: v4 세부 점수 보고서 (2026-03-07)*
