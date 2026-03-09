# SMS 기본문구 개별 탭 분리 + 메시지 영역 컬러 강화

**날짜:** 2026-03-09
**작업 유형:** UI/UX 개선

## 변경 개요

SMS 모달의 기본문구 3개를 각각 독립 탭으로 분리하고, 탭별 고유 컬러를 적용.
메시지 입력 영역(textarea, 바이트 카운터, 발송 버튼 영역)의 컬러 디자인 강화.

## 수정 파일 및 핵심 변경

### 1. `src/components/admin/SmsModal.jsx` — 탭 구조 변경

**기존:**
- "기본문구" / "특수문자" 2개 탭
- 기본문구 탭 내부에 3개 카드(참여 요청/독려/감사) 나열, 클릭 시 바로 적용

**변경:**
- "참여 요청" / "독려" / "감사" / "특수문자" 4개 독립 탭
- `activeTab` 기본값: `'tpl_0'` (첫 번째 문구 탭)
- 각 탭 클릭 시 문구 미리보기 패널 + "이 문구 적용" 버튼 표시
- 탭 버튼에 `styles.tabColor0` / `tabColor1` / `tabColor2` / `tabColorSymbol` 클래스 적용
- 미리보기에 `styles.tplPreview0~2`, 적용 버튼에 `styles.tplApplyBtn0~2` 클래스 적용

### 2. `src/components/admin/SmsModal.module.css` — 탭 컬러 + 메시지 영역 강화

**탭별 고유 컬러 (4색 체계):**
- `.tabColor0` — 인디고 (#4f46e5 / #a5b4fc): 참여 요청
- `.tabColor1` — 앰버 (#b45309 / #fcd34d): 독려
- `.tabColor2` — 에메랄드 (#047857 / #6ee7b7): 감사
- `.tabColorSymbol` — 퍼플 (#7c3aed / #c4b5fd): 특수문자
- 각 탭 활성 상태: 해당 색상의 `linear-gradient` 그라데이션

**문구 미리보기 카드:**
- `.templatePreview` — 공통 패딩/라운드
- `.tplPreview0` — 인디고 배경(#eef2ff) + 좌측 4px 인디고 보더
- `.tplPreview1` — 앰버 배경(#fffbeb) + 좌측 4px 앰버 보더
- `.tplPreview2` — 에메랄드 배경(#ecfdf5) + 좌측 4px 에메랄드 보더
- `.templateApplyBtn` / `.tplApplyBtn0~2` — 각 색상 그라데이션 버튼

**메시지 영역 컬러 강화:**
- `.textarea` — 좌측 보더 4px, padding 확대, line-height 1.6, 포커스 글로우
- `.byteCounter` — 인디고 그라데이션 배경 + 인디고 보더
- `.typeBadge` / `.badgeSms` / `.badgeLms` / `.badgeOver` — 그라데이션 + 보더 추가
- `.actions` — 인디고 그라데이션 배경 + 상단 2px 인디고 보더
- `.progressText` — 인디고 색상 + 볼드

**제거된 스타일:**
- `.templateList`, `.templateItem`, `.templateName`, `.templateContent` 등 기존 카드 리스트 스타일

## 커밋 이력

| 커밋 | 내용 |
|------|------|
| `2ebd0dd` | SMS 기본문구를 개별 탭으로 분리 + 메시지 영역 컬러 강화 |

## 검증

- `npm run build` 성공
- 4개 탭 전환 정상 동작
- 각 문구 탭 클릭 시 미리보기 + "이 문구 적용" 버튼 표시
- 적용 버튼 클릭 시 textarea에 문구 반영
- 탭별 고유 컬러(인디고/앰버/에메랄드/퍼플) 정상 렌더링
- 메시지 영역 컬러 강화 반영 확인
