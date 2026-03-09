# 2026-03-09 SMS 문자 발송 기능 구현

## 개요
프로젝트 연구자가 평가자에게 평가 참여 안내 문자(SMS/LMS)를 발송할 수 있는 기능 구현.
icodekorea 레거시 Java/JSP 모듈을 분석하여 Supabase Edge Function(Deno) TCP 소켓 방식으로 재구현.

## 아키텍처

```
[React SPA] → supabase.functions.invoke('send-sms')
                  ↓
[Supabase Edge Function: send-sms]
  → Deno.connect() TCP 소켓
  → 211.172.232.124:9201 (icodekorea 서버)
  → 바이너리 프레임 전송/수신
  → JSON 응답 반환
```

## 신규 파일 (5개)

### 1. `supabase/functions/send-sms/index.ts`
- **역할**: Supabase Edge Function — icodekorea TCP 소켓 SMS 발송
- **TCP 프로토콜**: Java `SMSComponent.java` 분석 기반
  - 프레임 구조: `[2B 타입 "06"][4B 길이(0패딩)][JSON 본문]`
  - 응답 구조: `[2B 타입 "02"][4B 길이][결과]` — 앞 2자 `"00"` = 성공
  - JSON 필드: `key`, `tel`, `cb`, `date`, `msg`, `title`
- **한글 유니코드 이스케이프**: `encodeKorean()` — Java의 `encode()` 재현
- **보안**: TOKEN, 발신번호는 환경변수(`ICODE_TOKEN`, `SMS_SENDER_NUMBER`)로 관리

### 2. `src/lib/smsUtils.js`
- **역할**: EUC-KR 바이트 카운터, SMS/LMS 판별 유틸리티
- **주요 함수**:
  - `getByteLength(str)` — 한글 2바이트, 영문/숫자 1바이트
  - `getSmsType(msg)` — 90B 이하 SMS, 2000B 이하 LMS, 초과 OVER
  - `getByteInfo(msg)` — 바이트 수 + 타입 + 최대값 종합 정보

### 3. `src/lib/smsService.js`
- **역할**: Edge Function 호출 래퍼
- **주요 함수**:
  - `sendSms({ receiver, message })` — 단일 발송
  - `sendSmsBulk(recipients, message, onProgress)` — 다수 순차 발송 + 진행률 콜백

### 4. `src/components/admin/SmsModal.jsx`
- **역할**: SMS 발송 모달 UI
- **기능**:
  - 수신자 목록 체크박스 선택/전체선택
  - 전화번호 없는 평가자 비활성 표시
  - 메시지 textarea + 실시간 바이트 카운터
  - SMS/LMS/OVER 뱃지 자동 전환
  - 발송 진행률 표시
  - 발송 결과(성공/실패) 요약 표시
- **재사용 컴포넌트**: `Modal`, `Button`, `formatPhone()`

### 5. `src/components/admin/SmsModal.module.css`
- SMS 모달 전용 스타일 (수신자 목록, 바이트 카운터, 결과 뱃지 등)

## 수정 파일 (2개)

### 6. `src/pages/EvaluatorManagementPage.jsx`
- SMS 발송 버튼 추가 (평가자 1명 이상일 때 표시)
- `smsModalOpen` state + `SmsModal` 컴포넌트 연동
- 버튼 위치: 평가자 목록 헤더 우측 (평가자 추가 버튼 옆)

### 7. `src/pages/EvaluatorManagementPage.module.css`
- `.listHeaderActions` 스타일 추가 (버튼 그룹 가로 배치)

## 레거시 참조 파일 (기존 `icode/` 디렉터리)

| 파일 | 용도 |
|------|------|
| `icode/sms/SMSComponent.java` | TCP 프로토콜 분석 원본 |
| `icode/sms/SMSConfig.java` | 서버 IP/포트/토큰 설정 |
| `icode/js/msg.js` | 바이트 카운터 로직 원본 |
| `icode/sms.jsp` | 발송 처리 JSP |
| `icode/sms.html` | 발송 UI HTML |

## Edge Function 배포

```bash
# 환경변수 (Dashboard에서 설정 완료)
ICODE_TOKEN=bbdaf2072e1a226cb9e888b2b3310196
SMS_SENDER_NUMBER=(발신번호)

# 배포 완료
npx supabase link --project-ref hcmgdztsgjvzcyxyayaj
npx supabase functions deploy send-sms
```

## 빌드 확인
- `npm run build` — 성공 (에러 없음)
