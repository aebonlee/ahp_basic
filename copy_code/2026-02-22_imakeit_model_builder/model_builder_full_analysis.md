# 모델구축 페이지 완전판 - 추가 분석

> model_builder.aspx.html의 확장 버전으로, 전체 JavaScript 로직을 포함하는 소스

## 이전 버전 대비 추가 발견사항

### 1. 페이지 상태: 평가자 배정 완료 후
- `parti_array` value="35239" (평가자 ID 배정됨)
- 서버 사이드 alert: "평가자 배정이 완료되었습니다. 이제 화면 맨 아래에 있는 '여기를(붉은 색)' 클릭해주세요."
- 이는 모델 구축 → 평가자 배정 → 모델 완료 순서의 워크플로우를 확인

### 2. load_model API 전체 코드
```javascript
$.ajax({
    url: '../modules/makeit.asmx/load_model',
    data: {prjid: 3946},
    type: 'post',
    success: function (data) {
        data2 = data;
        google.setOnLoadCallback(drawChart);
        total = 0;
        for (i = 0; i < data2[0].length; i++) {
            if (data2[0][i].isCo == "True") {
                total++;
            }
        }
    }
});
```
- 반환 데이터: `data2[0]` = 기준 배열, `data2[1]` = 대안 배열
- `isCo == "True"` 항목 수를 `total` 변수에 저장 (자식 노드 여부)

### 3. drawChart() 함수 전체 분석

#### 기준 차트 (chart_div)
- Google Visualization DataTable 4컬럼: Node, Parent, ToolTip, type(cattype)
- 루트 노드(프로젝트명) 스타일: `border: #fff`
- 노드 클릭 이벤트 리스너 등록

#### 기준 클릭 이벤트 상세
```javascript
google.visualization.events.addListener(chart, 'select', function () {
    // 1. 대안 패널 숨기고 기준 패널 표시
    // 2. 선택한 노드에서 Node, Tooltip(설명), cattype(평가방법) 추출
    // 3. 입력 필드에 기존 값 채움
    // 4. 마우스 위치 근처에 패널 표시 (clientX+20, clientY+20)
    // 5. 화면 오른쪽 끝 넘어가면 보정 (innerWidth - 200)
    // 6. 루트 노드(row==0)면: "기준추가" 모드 (수정/삭제 숨김)
    // 7. 하위 노드면: "하위기준추가" 모드 (수정/삭제 표시)
});
```

#### 대안 차트 (chart_div2)
- 3컬럼: Node, Parent, Tooltip
- 6개 단위 행 분리 로직: `i < 7`이면 그대로, 아니면 `(6*quo)+namu` 부모 계산
- 루트 노드: "：대안：" 표시

#### 대안 클릭 이벤트 상세
```javascript
google.visualization.events.addListener(chart2, 'select', function (event) {
    // 1. 기준 패널 숨기고 대안 패널 표시
    // 2. 루트 노드(row<1): "대안추가"만 표시 (수정/삭제/하위대안 숨김)
    // 3. 개별 대안: 수정/삭제/하위대안추가 모두 표시
    // 4. 마우스 위치 근처에 패널 표시
});
```

#### 하위대안 표시 로직
```javascript
$('.model_alt').each(function (index, item) {
    // 각 대안 노드에 대해
    // altdata3의 Tooltip에서 전각 쉼표(，)로 하위대안 split
    // 메인 대안은 .main_alt div로 감싸기
    // 각 하위대안은 .sub_alt div + X(삭제) 버튼 추가
    // 삭제 버튼: sub_alt_delete(e_id, index) 호출
});
```

### 4. 하위대안 삭제 함수
```javascript
function sub_alt_delete(e_id, num) {
    // confirm 후 hidden field에 "e_id,num" 설정
    // submit 버튼 click으로 서버 전송
    $('div#alt').addClass('visibleF');
    if (confirm("정말 삭제하시겠습니까?")) {
        $('#sub_div_action input[type=hidden]').val(e_id + "," + num);
        $('#sub_div_action input[type=submit]').click();
    }
}
```

### 5. 도움말 ON/OFF 토글
```javascript
function helper_change() {
    // sessionStorage("helper")로 상태 관리
    // "0": 도움말 OFF → explain_total2 숨김, OFF 버튼 활성화
    // "1": 도움말 ON → explain_total2 표시, ON 버튼 활성화
    // header에 동적으로 토글 버튼 추가
}
```
- 토글 UI: `<b id='helper_b'><span><b class='switch'>ON</b>도움말<b>OFF</b></span></b>`

### 6. 브라우저 감지
```javascript
// IE, Opera, Firefox, Chrome, Safari 감지
// Chrome에서 screen.innerWidth > 768일 때:
// #redaction, #cri, #alt 패널을 position: fixed로 설정
```

### 7. 기준 관리 UI 동작 상세
- **기준 버튼 클릭**: data-type에 따라 submit 버튼 표시/숨김
  - type="0": 하위기준추가 → 입력 필드 초기화, 평가방법 기본값 12(쌍대비교-실용)
  - type="1": 선택기준수정 → 기존 값 유지
  - type="2": 선택기준삭제 → confirm 후 서버 전송

- **평가방법 select 변경**: eval_type_id hidden field에 선택값 반영

### 8. 대안 관리 UI 동작 상세
- **대안 버튼 클릭**: data-type에 따라 표시
  - type="0": 대안추가 → alt_field_name 표시, sub_alt_field_name 숨김
  - type="1": 대안수정 → alt_field_name 표시, sub_alt_field_name 숨김
  - type="3": 하위대안추가 → alt_field_name 숨김, sub_alt_field_name 표시

### 9. 추가 도움말 (data-helpno 11~16)
| helpno | 제목 | 내용 |
|--------|------|------|
| 11 | 기준 입력 | 판단기준 입력 안내 (예: 가격, 성능, 디자인) |
| 12 | 기준 설명 입력 | 제3자도 이해할 수 있는 설명 입력 |
| 13 | 평가 방법 설정 | 쌍대비교-실용/직접입력/쌍대비교-이론 설명 |
| 14 | 대안 입력 | 대안 입력 안내 (예: 현대 소나타, 기아 K5) |
| 15 | 대안 설명 입력 | 대안 상세 정보 입력 (예: 배기량, 연비) |
| 16 | 하위 대안 입력 | 하위대안 입력 안내 (예: 현대차 → 소나타, 아반테) |

### 10. 단계별 안내 (#explain_total2)
- explain1: "② [프로젝트명] 상자를 클릭하여 기준을 추가합니다..."
- explain2: "③ 평가자 선택 버튼을 클릭하여..."
- "모델 예시" 버튼: model.html 팝업 (900x700)

### 11. 스크롤 위치 복원
```javascript
// chart_scroll의 scrollLeft를 sessionStorage('position_ahp')에 저장
// 페이지 로드 시 저장된 위치로 animate 복원
// table_width도 sessionStorage에서 복원
```

### 12. CSS 추가사항
- `header { position: relative }` (도움말 토글 버튼 절대위치 기준)
- `#brain_msg` 스타일: 브레인스토밍 링크 메시지
- `user-select: none` 여러 영역에 적용 (차트 영역 텍스트 선택 방지)

## React 구현 시 추가 고려사항

| 원본 기능 | React 구현 방안 |
|-----------|----------------|
| google.visualization.events.addListener | onClick 이벤트 핸들러 |
| window.event.clientX/clientY | React 이벤트 객체 e.clientX/clientY |
| position: fixed 패널 | Popover/Floating UI 컴포넌트 |
| sessionStorage 스크롤 복원 | useRef + useEffect 스크롤 복원 |
| confirm() 삭제 확인 | Custom ConfirmModal 컴포넌트 |
| helper ON/OFF | Context 또는 state로 도움말 표시 관리 |
| __doPostBack | Supabase mutation + optimistic update |
| 브라우저 감지 | 불필요 (최신 브라우저 기준 개발) |
| jQuery UI dialog | React Modal/Dialog 컴포넌트 |
