# 세션 32: 설문 5단계 QR 공개 배포 + 평가 진행률 + UI 개선

**날짜:** 2026-03-07
**작업 유형:** 기능 추가 + 버그 수정 + UI 개선

---

## 작업 요약

| # | 작업 | 커밋 |
|---|------|------|
| 1 | 설문 5단계 공개 배포(QR) + 평가 진행률 기능 추가 | `e817a9b` |
| 2 | get_project_for_invite DROP 후 재생성 (반환 타입 변경 오류 수정) | `44dfee5` |
| 3 | 진행률 100%일 때 상태를 '완료'로 표시 | `c6ce74b` |
| 4 | 인구통계 템플릿에 이메일 항목 추가 + 리커트 라디오버튼 가시성 개선 | `c9a5d57` |

---

## 1. 설문 5단계 — 공개 배포 설정 (QR 코드)

### 변경 파일
- `src/pages/SurveyBuilderPage.jsx` — Step 5 탭 + StepDistribute 컴포넌트 추가
- `src/pages/SurveyBuilderPage.module.css` — 토글, 비밀번호 입력, QR 코드 스타일
- `src/hooks/useSurvey.js` — useSurveyConfig에 `access_code`, `public_access_enabled` 필드 추가
- `package.json` — `qrcode.react` 의존성 추가

### 기능
- 공개 접근 활성화 토글 (체크박스)
- 4자리 숫자 비밀번호 입력 (onBlur 시 DB 자동 저장)
- QR 코드 실시간 생성 (`QRCodeSVG`)
- URL 복사 버튼
- QR 이미지 PNG 다운로드 (SVG → Canvas → PNG)

---

## 2. 공개 접근 플로우 (InviteLandingPage)

### 변경 파일
- `src/pages/InviteLandingPage.jsx` — 비밀번호 인증 + 자가등록 플로우 추가
- `src/pages/InviteLandingPage.module.css` — `.regInput` 스타일 추가

### 플로우
1. QR 코드 스캔 → 초대 페이지 접속
2. `public_access_enabled=true` 감지 → 4자리 비밀번호 입력 화면
3. RPC `public_verify_access` → 비밀번호 검증
4. 이름 + 전화번호 입력 → RPC `public_register_evaluator` → 자동 평가자 등록
5. 평가 시작으로 이동

---

## 3. 평가자 관리 — 진행률 + 구분 배지

### 변경 파일
- `src/pages/EvaluatorManagementPage.jsx` — 진행률 바 + QR/직접등록 배지 + 상태 로직
- `src/pages/EvaluatorManagementPage.module.css` — 배지/프로그레스 바 스타일

### 테이블 확장 (5→7 컬럼)
```
이름 | 이메일 | 전화번호 | 구분 | 진행률 | 상태 | 관리
```

- **구분:** `registration_source === 'public'` → "QR 접속" (파란 배지) / "직접 등록" (회색 배지)
- **진행률:** `buildPageSequence()`로 전체 비교 쌍 수 계산, 평가자별 완료 수 / 전체 수 = 퍼센트
- **상태:** `ev.completed || pct >= 100` → "완료" 표시 (진행률 100%면 자동 완료)

---

## 4. DB 마이그레이션 (013_public_access_qr.sql)

### 스키마 변경
```sql
ALTER TABLE projects ADD COLUMN access_code TEXT;
ALTER TABLE projects ADD COLUMN public_access_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE evaluators ADD COLUMN registration_source TEXT DEFAULT 'admin';
```

### RPC 함수
- `get_project_for_invite` — 반환값에 `public_access_enabled` 추가 (DROP 후 재생성)
- `public_verify_access` — 비밀번호 검증 (SECURITY DEFINER)
- `public_register_evaluator` — 자가 등록 (SECURITY DEFINER)

---

## 5. 리커트 척도 라디오버튼 가시성 개선

### 문제
- 리커트 선택 시 배경이 다크블루(`var(--color-primary)`)로 변경됨
- 브라우저 기본 라디오버튼도 다크블루 → 배경과 동화되어 선택 여부 구분 불가

### 해결
- `<input type="radio">` 제거 → 커스텀 원형 체크 표시로 대체
- `.likertCircle` — 회색 테두리 원형 (미선택)
- `.likertCheck` — 흰색 채워진 원 (선택됨)
- 선택 시: 다크블루 배경 + 흰색 원형 체크 + 흰색 텍스트

---

## 6. 인구통계 템플릿 이메일 항목 추가

### 변경
- 기존 11개 → 12개 항목
- '이메일 주소' (short_text, 선택) 항목 추가
- '연락처 (이메일 또는 전화번호)' → '연락처 (전화번호)'로 변경

### 참고
- 기존 프로젝트에 이미 로드된 질문은 자동 변경되지 않음
- 새로 "인구통계 기본 템플릿 로드" 클릭 시 12개 질문 추가

---

## 배포
- GitHub Actions 자동 배포 (main push → 빌드 → gh-pages)
- 배포 URL: `ahp-basic.dreamitbiz.com`
- DB: Supabase SQL Editor에서 `013_public_access_qr.sql` 수동 실행 필요
