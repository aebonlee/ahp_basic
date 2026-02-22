# 브레인스토밍(Delphi/Brainstorming) 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?key=brain
- **페이지 타이틀**: 델파이/브레인스토밍
- **역할**: 대안/장단점/판단기준을 시각적으로 도출하여 AHP 모델 구축

## 핵심 기능

### 4개 영역 (Drag & Drop 기반)
1. **대안 영역 (#alt_brain)**: 생각하는 대안을 모두 입력
2. **장점 영역 (#pros_brain)**: 대안의 장점을 모두 입력
3. **단점 영역 (#cons_brain)**: 대안의 단점을 모두 입력
4. **판단기준 영역 (#cri_brain)**: 판단기준을 모두 입력

### 사용 흐름
1. 대안 → 장단점 → 판단기준 순으로 입력
2. 장단점을 판단기준 영역으로 Drag & Drop → 새 기준명 입력 프롬프트
3. 판단기준끼리 Drag & Drop → 부모-자식 계층구조 생성 (최대 5차 기준)
4. "모델보기"로 Google OrgChart 미리보기
5. "모델확정"으로 최종 모델 저장

### 계층 레벨 표시 (색상 코딩)
| 레벨 | 색상 | CSS |
|------|------|-----|
| 1차 기준 | #BAA65D (골드) | data-level='1' |
| 2차 기준 | #666 (회색) | data-level='2' |
| 3차 기준 | #888 | data-level='3' |
| 4차 기준 | #ccc | data-level='4' |
| 5차+ | #000 배경 #fff 글자 | 기본 |

### 핵심 API
```javascript
// 모델 확정 저장
$.ajax({
    url: 'pm_ajax.asmx/save_brain',
    type: 'post',
    data: {
        cri_name: cri_name_arr,  // 기준명 배열
        cri_id: cri_id_arr,      // 기준 ID 배열
        cri_pid: cri_pid_arr,    // 부모 ID 배열
        alt_name: alt_name_arr   // 대안명 배열
    }
});
```

### 데이터 구조
- **기준 요소**: data-type="cri", data-id, data-pid(부모ID), data-level
- **대안 요소**: data-type="alt"
- **장점 요소**: data-type="pros"
- **단점 요소**: data-type="cons"
- 장단점은 기준 영역으로 드래그 시 data-type="cri"로 변환

### UI 특이사항
- **휴지통**: 각 영역에 Drag & Drop으로 삭제
- **더블클릭**: 이름 수정 (prompt)
- **크게 보기**: 전체화면 모드 (position: fixed)
- **접기/펴기**: 대안+장단점 영역 숨기기
- **도움말 토글**: 사용방법 접기/펴기

## React 변환 시 매핑
| 원본 | React 구현 |
|------|-----------|
| HTML5 Drag & Drop | React DnD 또는 @dnd-kit |
| brain_make_ele() | React state + 컴포넌트 렌더링 |
| sessionStorage drag data | React DnD context |
| pm_ajax.asmx/save_brain | Supabase batch insert |
| Google OrgChart 미리보기 | React 트리 컴포넌트 |
| prompt() 수정 | 인라인 편집 또는 모달 |
