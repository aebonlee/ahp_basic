# AHP Basic - 개발 가이드

## 1. 프로젝트 개요
- **프로젝트명**: AHP Basic
- **목표**: "i make it" 서비스의 AHP(Analytic Hierarchy Process) 기능을 완벽 복제 구현
- **GitHub**: https://github.com/aebonlee/ahp_basic
- **참고 리포**: https://github.com/aebonlee/www (www.dreamitbiz.com)

## 2. 기술 스택
| 구분 | 기술 | 버전 | 비고 |
|------|------|------|------|
| Frontend | React | 18.x | www 리포 기반 |
| Build Tool | Vite | 5.x | 빠른 개발 서버 |
| Database | Supabase | latest | PostgreSQL 기반 BaaS |
| Auth | Supabase Auth | - | 로그인/회원가입 |
| Styling | CSS3 | - | www 리포 디자인 복제 |
| State | Context API | - | Theme, Language, Auth |
| Routing | React Router DOM | 6.x | SPA 라우팅 |
| Hosting | 미정 | - | GitHub Pages / Vercel |

## 3. 개발 환경 설정
```bash
# 프로젝트 클론
git clone https://github.com/aebonlee/ahp_basic.git

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 4. 폴더 구조
```
D:\ahp_basic\
├── copy_code/          # 웹 복제 소스 보관
├── Dev_md/             # 개발 문서
│   ├── 01_Guide/       # 개발 가이드
│   ├── 02_Design/      # 디자인 문서
│   ├── 03_DevLog/      # 개발 로그/일지
│   ├── 04_Inspection/  # 점검 일지
│   ├── 05_Evaluation/  # 평가 일지
│   └── 06_Reference/   # 참고 자료
├── src/                # 소스 코드 (예정)
├── public/             # 정적 파일 (예정)
└── package.json        # (예정)
```

## 5. 개발 프로세스
1. 사용자가 PDF 문서 또는 웹 소스를 제공
2. `copy_code/`에 원본 소스 저장
3. 소스 분석 후 개발 계획 수립
4. 구현 및 테스트
5. 모든 과정을 `Dev_md/`에 기록

## 6. www 리포 참고 항목
- **디자인 시스템**: Color Palette, Typography, Layout Grid
- **컴포넌트 구조**: Navbar, Footer, Page Layout
- **상태 관리**: ThemeContext, LanguageContext 패턴
- **반응형 디자인**: Mobile-first 접근
