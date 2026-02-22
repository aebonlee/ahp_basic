# default.aspx 소스 분석

## 페이지 정보
- **파일**: default.aspx (관리자 메인 페이지)
- **기술**: ASP.NET WebForms + jQuery 1.11.0
- **역할**: 관리자 MODE 메인 대시보드

## HTML 구조 분석

### Header
- 로고: "I MAKE IT" / "AHP Solution"
- 사용자 정보 (user.png 아이콘)
- 메뉴: 계정정보(팝업), 문의/교육신청, 로그아웃

### 좌측 패널 1: 프로젝트 관리 (#project_detail)
- **시작하기** 버튼 + 도움말(?)
- **브레인스토밍** 버튼 (별도 팝업: brain.aspx)
- **프로젝트 목록** 테이블 (#project_list)
  - data-id, data-name, data-desc, data-type, data-state 속성
  - 상태 표시: (생성중), (대기중), (평가중), (평가종료)
- **프로젝트 생성 폼** (#pro)
  - 프로젝트 이름 (pro_name)
  - 프로젝트 설명 (pro_desc)
  - 평가방법 선택: 쌍대비교-실용(12), 직접입력(20), 쌍대비교-이론(10)
  - 생성/수정/취소 버튼
- **프로젝트 관리 메뉴** (#pro_2)
  - 프로젝트 관리, 수정, 삭제, 중단/완료, 워크숍 진행, e-mail발송

### 좌측 패널 2: 평가자 관리 (#parti_detail)
- **평가자 선택** + 도움말(?)
- **평가자 목록** (#parti_list)
  - 전체 선택 체크박스
  - 개별 평가자: data-id, data-email, data-name, data-tel
- **평가자 입력 폼** (#parti)
  - e-mail, 이름, 전화번호
  - 수정/취소 버튼
- **평가자 배정** 버튼
- **평가자 수정/삭제** 메뉴

### 메인 콘텐츠 (#pm_main_div)
- 환영 메시지
- CEO 인사말
- **프로젝트 관리 과정 소개** (4단계):
  1. 프로젝트 생성
  2. 모델 구축 및 평가자 추가/배정
  3. 평가 시작
  4. 결과 보기
- hover 시 각 단계 설명 표시

### MODE 전환 (#mode_div)
- 현재: 관리자 MODE
- 평가자 MODE로 이동 버튼

### Footer
- 사용방법 다운로드 (PDF 팝업)
- 교육 및 자문 의뢰
- ExpertChoice 로고

### 도움말 시스템 (.help_div)
- data-helpno 0~6까지 7개 도움말
- 팝업 방식으로 표시/닫기

## JavaScript 분석

### 세션 관리
- `check_manager` API 5분(300000ms) 간격 호출
- sessionStorage: table_width, position_ahp

### 이벤트 핸들링
- `.loading` 클릭 시 프로그레스 바 표시
- `.help_btn` 클릭 시 해당 도움말 표시
- `#introduce li` hover 시 설명 변경
- 만료 체크: end값이 0이 아니면 자동 로그아웃

### 외부 스크립트
- `../script/ie_trident.js` - IE 감지
- `../script/imakeit_pm.js` - 프로젝트 관리 로직 (핵심!)

## 핵심 데이터 구조 (HTML에서 추출)

### 프로젝트 (project_list)
```
{
  id: 3946,
  name: '대학원생의 연구역량',
  desc: '대학원생의 연구역량',
  type: 10,      // 쌍대비교-이론
  state: 2       // 생성중=2
}
```

### 평가방법 코드
```
10 = 쌍대비교-이론
12 = 쌍대비교-실용 (기본값)
20 = 직접입력
```

### 프로젝트 상태 (추정)
```
1 = 대기중
2 = 생성중
3 = 평가중
4 = 평가종료
```

### 평가자 (parti_list)
```
{
  id: 35239,
  email: 'aebon260221152729',
  name: '관리자',
  tel: ''
}
```

## React 변환 시 주요 매핑

| 원본 (ASP.NET/jQuery) | React 구현 |
|----------------------|-----------|
| default.aspx | App.jsx (라우터) |
| #project_detail | ProjectPanel 컴포넌트 |
| #parti_detail | ParticipantPanel 컴포넌트 |
| #pm_main_div | Dashboard 컴포넌트 |
| #mode_div | ModeSwitch 컴포넌트 |
| .help_div | HelpModal 컴포넌트 |
| __VIEWSTATE | Supabase state |
| makeit.asmx | Supabase API |
| sessionStorage | React Context / Zustand |
| imakeit_pm.js | 각 컴포넌트 로직 분리 |
