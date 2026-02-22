# 개발일지 - 2026-02-22 프로젝트 초기화

## 작업 내용
### 1. 프로젝트 구조 수립
- `copy_code/` 폴더 생성: 사용자 제공 웹 소스 보관용
- `Dev_md/` 폴더 및 하위 구조 생성

### 2. GitHub 리포지토리 분석
- **ahp_basic**: 초기 상태 (README.md만 존재)
- **www (dreamitbiz.com)**: React 18 + Vite SPA, 디자인/구조 참고 대상

### 3. www 리포 분석 결과
| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + Vite |
| 라우팅 | React Router DOM |
| 상태관리 | Context API (Theme, Language) |
| 디자인 | CSS3 커스텀, Noto Sans KR |
| 배포 | GitHub Pages |
| 인증 | 없음 (마케팅 사이트) |

### 4. 기술 스택 결정
- **Frontend**: React 18 + Vite (www 리포 동일)
- **Database/Auth**: Supabase (사용자 요구사항)
- **디자인**: www 리포 디자인 시스템 복제 후 AHP에 맞게 확장

## 다음 단계
- [ ] 사용자로부터 PDF 문서 및 웹 소스 수령 대기
- [ ] 수령 시 copy_code/에 저장 및 분석
- [ ] 분석 결과 기반 상세 개발 계획 수립
- [ ] React + Vite + Supabase 프로젝트 초기화

## 이슈/메모
- www 리포에는 인증 기능이 없으므로 Supabase Auth를 별도 구현 필요
- AHP 알고리즘 로직은 "i make it" 서비스 분석 후 구현 예정
