# 모델구축(Model Builder) 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?id=3946 (프로젝트 ID 기반)
- **페이지 타이틀**: 모델구축
- **역할**: AHP 계층구조 모델을 시각적으로 구축하는 핵심 페이지

## 추가 의존성 (메인 페이지 대비)
- **jQuery UI 1.11.4**: 드래그, 다이얼로그 등
- **Google Visualization API**: OrgChart (조직도/트리 차트)
- **Google jsapi**: 차트 라이브러리 로딩

## 핵심 API 호출
```javascript
// 모델 데이터 로드
$.ajax({
    url: '../modules/makeit.asmx/load_model',
    data: { prjid: 3946 },
    type: 'post'
});
// 반환 데이터 구조: data[0] = 기준(Criteria), data[1] = 대안(Alternative)
```

## 데이터 구조

### 기준(Criteria) 데이터 - data[0]
```javascript
{
    Node: "기준명",       // 노드 표시명 (HTML 가능)
    Parent: "상위기준명",  // 부모 노드 (null이면 루트)
    Tooltip: "설명",      // 기준 설명
    cattype: "10",        // 평가방법 코드 (10/12/20)
    isCo: "True/False"    // 자식노드 여부 (total 계산용)
}
```

### 대안(Alternative) 데이터 - data[1]
```javascript
{
    Node: "대안명",
    Parent: "상위대안명",
    Tooltip: "하위대안들 (，로 구분)",  // 쉼표가 아닌 전각 쉼표(，)
    E_id: "대안ID"
}
```

## UI 구성 요소

### 1. 기준 트리 차트 (#chart_div)
- Google Visualization OrgChart로 렌더링
- 클릭 시 기준 관리 패널 표시
- 루트 노드(프로젝트명) 클릭: "기준추가" 모드
- 하위 노드 클릭: "하위기준추가" 모드
- 줌 기능: +/- 버튼 (200px 단위, 최소 900px)

### 2. 기준 관리 패널 (#cri)
- **하위기준추가**: 선택한 기준 아래에 하위기준 생성
- **선택기준수정**: 기준명, 설명, 평가방법 수정
- **선택기준삭제**: 확인 후 삭제 (confirm)
- **입력 필드**: 기준명, 설명(textarea), 평가방법(select)

### 3. 대안 트리 차트 (#chart_div2)
- 기준 차트 아래에 별도 OrgChart
- "대안" 루트 노드 + 개별 대안 노드
- 하위대안: 각 대안 노드 안에 서브 div로 표시
- 6개 단위로 행 나눔 (레이아웃 최적화)

### 4. 대안 관리 패널 (#alt)
- **대안추가**: 새 대안 생성
- **대안수정**: 대안명 수정
- **대안삭제**: 확인 후 삭제
- **하위대안추가**: 선택한 대안 아래에 하위대안 생성

### 5. 모델 완료 (#btn_div)
- "여기를" 버튼 클릭으로 모델 구축 완료
- ctl10$model_f submit

### 6. 도움말 ON/OFF 토글
- header에 동적 추가
- sessionStorage("helper")로 상태 관리
- ON: 도움말 가이드 표시 / OFF: 숨김

### 7. 브레인스토밍 안내
- 기준 추가 전에만 사용 가능
- "여기를" 클릭 → default.aspx?key=brain

## 핵심 로직

### 모델 트리 렌더링
1. `load_model` API 호출
2. Google OrgChart에 데이터 바인딩
3. 기준 차트: 프로젝트명(루트) → 기준 → 하위기준
4. 대안 차트: "대안"(루트) → 개별 대안 (6개씩 행 분리)

### 기준 클릭 이벤트
1. 클릭한 노드 정보 추출 (Node, Tooltip, cattype)
2. 입력 필드에 기존 값 채움
3. 마우스 위치 근처에 관리 패널 표시
4. 루트 노드면 "기준추가", 하위면 "하위기준추가"

### 대안 클릭 이벤트
1. 클릭한 노드 정보 추출
2. 루트 노드면 "대안추가"만 표시
3. 개별 대안이면 수정/삭제/하위대안추가 표시

### 하위대안 표시
- 대안의 Tooltip에 전각 쉼표(，)로 하위대안 구분
- 각 하위대안에 X(삭제) 버튼 표시
- sub_alt_delete(e_id, index) 함수로 삭제

## React 변환 시 핵심 매핑

| 원본 | React 구현 |
|------|-----------|
| Google OrgChart | React Flow / D3.js 트리 또는 커스텀 트리 컴포넌트 |
| load_model API | Supabase query (criteria + alternatives 테이블) |
| jQuery UI | React DnD / 자체 구현 |
| #cri 패널 | CriteriaPanel 컴포넌트 (Context Menu) |
| #alt 패널 | AlternativePanel 컴포넌트 |
| sessionStorage | React state / Context |
| confirm() | Custom Modal 컴포넌트 |
| __doPostBack | Supabase mutation + state update |

## Supabase DB 테이블 설계 (이 소스 기반)

### criteria 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial | PK |
| project_id | int | FK → projects |
| name | text | 기준명 |
| description | text | 설명 |
| parent_id | int | 상위 기준 ID (null=1차 기준) |
| eval_method | int | 10/12/20 |
| sort_order | int | 정렬 순서 |

### alternatives 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial | PK |
| project_id | int | FK → projects |
| name | text | 대안명 |
| parent_id | int | 상위 대안 ID (null=1차 대안) |
| sort_order | int | 정렬 순서 |
