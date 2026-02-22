# AHP Basic - 디자인 시스템

## 1. 디자인 원칙
- www.dreamitbiz.com의 디자인 시스템을 기반으로 AHP에 맞게 확장
- 일관된 UI/UX 경험 제공
- 반응형 디자인 (Desktop / Tablet / Mobile)

## 2. 컬러 팔레트 (www 리포 기준)
| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| Primary Blue | #0066CC | 주요 액션, 링크 |
| Background | #FFFFFF | 기본 배경 |
| Light Gray | #F7F9FC | 섹션 배경 |
| Text Primary | #1A1A1A | 본문 텍스트 |
| Text Secondary | #666666 | 보조 텍스트 |
| AHP Accent | TBD | AHP 전용 강조색 |

## 3. 타이포그래피
- **기본 폰트**: Noto Sans KR (Google Fonts)
- **제목**: 700 weight
- **본문**: 400 weight
- **크기 체계**: 8px 기반 스케일

## 4. 레이아웃
- **최대 너비**: 1200px
- **그리드**:
  - Desktop: 3컬럼
  - Tablet: 2컬럼
  - Mobile: 1컬럼
- **간격**: 8px 기반 spacing system

## 5. 컴포넌트 목록 (예정)
| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| Navbar | 예정 | 상단 네비게이션 (www 참고) |
| Footer | 예정 | 하단 푸터 (www 참고) |
| Login Form | 예정 | Supabase Auth 연동 |
| AHP Matrix | 예정 | 쌍대비교 매트릭스 |
| AHP Result | 예정 | 결과 시각화 |
| Dashboard | 예정 | 사용자 대시보드 |

## 6. 테마 지원
- Light Mode / Dark Mode 토글 (www 리포 ThemeContext 활용)
- 다국어 지원: 한국어 / 영어 (www 리포 LanguageContext 활용)
