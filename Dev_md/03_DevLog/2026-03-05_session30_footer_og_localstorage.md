# 2026-03-05 — 푸터 리디자인 + OG 메타 태그 + localStorage 제거

> **날짜**: 2026-03-05
> **커밋**: 5건 (`55d99af`, `c42d9f6`, `756ef8a`, `0017b55`, `aa63f51`)
> **변경 파일**: 7개 (코드) + 1개 (이미지) + 1개 (개발일지)

---

## 커밋 타임라인

| 커밋 | 내용 |
|:----:|------|
| `55d99af` | 공개 푸터 www.dreamitbiz.com 스타일 3컬럼 구조로 리디자인 |
| `c42d9f6` | og:site_name, og:url 메타 태그 추가 (카카오톡 스크랩 대응) |
| `756ef8a` | og:image 추가 — AHP 계층 구조 다크 테마 OG 이미지 생성 |
| `0017b55` | og:image 배경색 밝게 조정 (#111827 → #1e3a6e) |
| `aa63f51` | localStorage 사용 전면 제거 — React 상태로 전환 |

---

## 1. 공개 푸터 리디자인 (`55d99af`)

### PublicFooter.jsx — www.dreamitbiz.com 스타일 3컬럼 구조

기존 심플 1줄 푸터 → www.dreamitbiz.com과 동일한 3컬럼 기업 푸터로 전면 교체.

| 컬럼 | 내용 |
|------|------|
| 1열 (브랜드) | AHP Basic 로고 + 서비스 설명 + 회사 정보 (대표, 사업자번호, 통신판매신고) |
| 2열 (바로가기) | AHP Basic 자체 메뉴 8개 (홈, AHP 소개, 주요 기능, 설문 및 통계, 관리 기능, 이용 가이드, 사용설명서, 로그인) — 2단 컬럼 |
| 3열 (연락처) | 주소, 이메일, 전화, 카카오톡, 영업시간 + Family Site 드롭다운 |

### PublicFooter.module.css — 스타일 상세

| 항목 | 값 |
|------|-----|
| 배경 | `linear-gradient(180deg, #111827 → #0A0F1A)` |
| 그리드 | `2fr 1.5fr 1.3fr`, gap 48px |
| 패딩 | 상단 80px, 하단 32px |
| 반응형 | 900px → 2컬럼, 600px → 1컬럼 |
| 링크 hover | `#93C5FD` (밝은 블루) |
| Family Site | `rgba(255,255,255,0.08)` 배경, 6px 라운드 |
| 하단 저작권 | `© 2020-{year} DreamIT Biz. All rights reserved.` |

---

## 2. Open Graph 메타 태그 추가 (`c42d9f6`, `756ef8a`, `0017b55`)

### 카카오톡 스크랩 대응 — index.html 수정

**추가된 메타 태그:**

```html
<meta property="og:site_name" content="AHP Basic" />
<meta property="og:url" content="https://ahp-basic.dreamitbiz.com" />
<meta property="og:image" content="https://ahp-basic.dreamitbiz.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### OG 이미지 생성 — public/og-image.png (1200x630)

`sharp` 라이브러리로 SVG → PNG 변환하여 생성 (일회성 사용 후 제거).

**이미지 디자인:**
- 배경: `linear-gradient(#1e3a6e → #0f2b5b)` (밝은 네이비)
- 좌측: AHP 배지 로고 + "Basic" 텍스트 + "Decision Analysis Platform" + 한글 설명
- 우측: AHP 계층 구조 다이어그램 (Goal → C1/C2 → A1/A2/A3) — 4색 노드
- 하단 우측: `ahp-basic.dreamitbiz.com` 워터마크

---

## 3. localStorage 전면 제거 (`aa63f51`)

프로젝트 정책: **모든 데이터는 localStorage 사용 금지.**

### 제거 내역 (3개 파일, 7곳)

| 파일 | 제거된 키 | 대체 방식 |
|------|----------|----------|
| `src/contexts/AuthContext.jsx` | `ahp_mode` (getItem + setItem) | React 메모리 상태만 사용 |
| `src/components/layout/Navbar.jsx` | `ahp_theme` (getItem + setItem) | React 메모리 상태 (기본 light) |
| `src/pages/ResourceAllocationPage.jsx` | `ahp-scenarios-${id}` (getItem + setItem) | React 메모리 상태 |

### 영향 범위

- 모드/테마/시나리오는 페이지 새로고침 시 기본값으로 초기화
- `sessionStorage` (평가자 인증용)는 탭 단위 세션 데이터로 별도 유지

---

## 최종 OG 스크랩 결과

| 항목 | 값 |
|------|-----|
| og:url | `https://ahp-basic.dreamitbiz.com` |
| og:title | `AHP Basic - 의사결정 분석 도구` |
| og:description | `AHP 다기준 의사결정 분석 도구. 기준 설정부터 쌍대비교, 결과 분석까지.` |
| og:type | `website` |
| og:site_name | `AHP Basic` |
| og:image | `https://ahp-basic.dreamitbiz.com/og-image.png` |

---

## 검증

- `npm run build` 성공
- 총 5건 커밋, GitHub Pages 배포 완료
- localStorage 잔여 사용: 0건 (grep 확인)
