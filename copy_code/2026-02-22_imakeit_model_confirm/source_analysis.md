# 모델확정(Model Confirm) 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?id=3946 (모델 완료 후 상태)
- **페이지 타이틀**: 모델구축
- **프로젝트 상태**: 대기중 (data-state='6')
- **역할**: 모델 구축 완료 후 평가 시작 전 확인/수정 단계

## 이전 단계와의 차이
- 프로젝트 상태: 생성중(2) → **대기중(6)**
- alert: "현재 모델로 평가를 시작하게 됩니다. 평가가 시작되면 모델을 수정하기가 어렵습니다..."
- parti_array="35239" (평가자 배정 완료)

## 핵심 UI 구성

### 1. 확인 다이얼로그 (#confirm_div)
- 모달 오버레이 (rgba(0,0,0,0.8))
- "모델을 수정하려면 여기를 클릭합니다" 옵션
- #start_choice_div를 confirm_div 안으로 이동 (jQuery prepend)

### 2. 평가 시작 선택지 (#start_choice_div)
- **웹을 통한 평가 시작** (ctl10$start_model): 일반 평가 시작
  - confirm 메시지: 프로젝트 상태가 "평가 중"으로 변경, 수정 시 데이터 삭제 경고
- **워크숍 평가** (ctl10$workshop): 전체 평가자 한자리 모여 평가
  - 별도 confirm 메시지

### 3. 수정 버튼 (#redaction)
- 기준/대안 차트 노드 클릭 시 "수정" 버튼 표시
- 마우스 위치 근처에 패널 표시

### 4. 안내 메시지 (#explain_total2)
- "기준, 대안, 평가자 등을 수정하고자 할때는 원하는 요소를 클릭하여 수정할 수 있습니다."
- "지금까지 작업한 모든 것을 취소하고자 할 경우에는 [시작하기]에서 해당 프로젝트를 선택하여 삭제합니다."

## drawChart() 특이사항
- 이전 버전과 달리 cattype 컬럼 없음 (3컬럼: Node, Parent, Tooltip)
- 기준 차트 클릭 시 #redaction 패널 표시 (CRUD 없이 수정 버튼만)
- 대안 차트 클릭 시에도 동일하게 #redaction 패널 표시

## React 변환 시 주요 매핑
| 원본 | React 구현 |
|------|-----------|
| #confirm_div 모달 | ConfirmDialog 컴포넌트 |
| start_model / workshop 선택 | StartEvaluationModal 컴포넌트 |
| #redaction 수정 버튼 | EditModeOverlay 컴포넌트 |
| jQuery prepend DOM 이동 | React 조건부 렌더링 |
