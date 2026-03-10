# SMS 발송 실패 수정

## 날짜
2026-03-10

## 개요
SMS 발송 시 모든 메시지가 실패하는 문제를 수정했다.

## 원인 분석

### 1. Edge Function JSON 빌드 시 특수문자 미이스케이프 (CRITICAL)
- `buildRequestJson()` 함수가 문자열 연결(template literal)로 JSON을 조립
- 메시지에 개행(`\n`), 쌍따옴표(`"`), 백슬래시(`\`) 등이 포함되면 JSON 문법 오류 발생
- icode korea TCP 서버가 깨진 JSON을 파싱 실패 → 발송 실패
- **SMS 템플릿은 전부 줄바꿈을 포함**하므로 템플릿 사용 시 100% 실패

### 2. `{이름}` 플레이스홀더 미치환 (Feature Bug)
- 템플릿에 `{이름}님`이 포함되어 있으나, 발송 시 수신자별로 치환하지 않음
- 리터럴 텍스트 `{이름}` 그대로 발송됨

### 3. `handleSend` 에러 핸들링 부재
- `SmsModal.jsx`의 `handleSend`에 try-catch가 없어, 예기치 못한 에러 발생 시 UI 멈춤

## 수정 내용

### `supabase/functions/send-sms/index.ts`
1. `escapeForJson()` 함수 추가 — JSON 문자열 리터럴에 안전하게 삽입하기 위한 이스케이프
   - `\n` → `\\n`, `"` → `\\"`, `\` → `\\\\`, `\r` → `\\r`, `\t` → `\\t`
2. `buildRequestJson()`에서 `encodeKorean()` 호출 전에 `escapeForJson()` 적용
   - 순서: 원본 메시지 → JSON 이스케이프 → 한글 유니코드 인코딩

### `src/lib/smsService.js`
1. `sendSmsBulk()`에서 수신자별 `{이름}` 플레이스홀더 치환 추가
   - `message.replace(/\{이름\}/g, recipients[i].name || '')`

### `src/components/admin/SmsModal.jsx`
1. `handleSend`에 try-catch-finally 추가
   - 에러 발생 시 전체 수신자를 실패로 표시
   - finally에서 `setSending(false)` 호출하여 UI 멈춤 방지

## 배포
- Edge Function: `npx supabase functions deploy send-sms` 실행 완료
- 프론트엔드: GitHub Actions 자동 배포 (main push 시)

## 영향 범위
- SMS 발송 기능 전체 (SmsModal → smsService → Edge Function)
- `{이름}` 플레이스홀더가 있는 모든 SMS 템플릿
