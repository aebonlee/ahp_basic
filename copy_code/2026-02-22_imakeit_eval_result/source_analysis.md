# 평가결과(Evaluation Result) 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?key=result (평가자 MODE)
- **페이지 타이틀**: 평가결과
- **역할**: 평가 완료 후 결과 확인, 비일관성비율 점검, Excel 저장, 평가 완료 처리

## 핵심 기능

### 1. 모델 트리 표시
- Google OrgChart: load_model API로 기준/대안 트리 렌더링
- ASP.NET TreeView: 좌측 계층형 트리 표시 (collapsible)
- 모델 보기/접기 토글 (model_btn2)
- 모델 상하/좌우 보기 전환 (model_switch)

### 2. 기준 종합중요도 (ctl10_result2_GP_Criterion_pannel)
- 1차 기준 + 2차 기준 모두 표시
- cri_level data-lev 속성으로 레벨 구분
- 레벨별 색상: result_total_color() 함수로 동적 적용
- 범례: lev_back_color + 차수 표시

### 3. 실제 데이터 (TreeView 기반, 기준 ID 확인)
```
대학원생의 연구역량
├─ 창의력 (17.503%, ID:80948)
│  ├─ 자료 검색 (3.501%, ID:80952)
│  └─ 사고력 (14.003%, ID:80953)
├─ 분석능력 (17.503%, ID:80949)
│  ├─ 데이터 분석 (14.586%, ID:80954)
│  └─ 수치 분석 (2.917%, ID:80955)
├─ 기술능력 (24.07%, ID:80950)
│  ├─ 도구 사용 (2.407%, ID:80956)
│  └─ 컴퓨터 활용 (21.663%, ID:80957)
└─ 문제 해결능력 (40.923%, ID:80951)
   ├─ 알고리즘 수립 (4.547%, ID:80958)
   └─ 알고리즘 평가 (36.376%, ID:80959)
```

### 4. 세부 결과 API (par_ajax.asmx/par_result)
- type=1: 수준별 기준 중요도 → cri_add_div
- type=2: 기준별 대안 중요도 → alt_add_div
- type=3: 대안 하위요소 중요도 → alt_sub_add_div
- 반환 데이터 구조:
```javascript
{
  title: "기준명",
  name: ["하위요소1", "하위요소2"],
  val: [0.5, 0.5],
  cr: "0.05787",
  complite: "완료/미완료 상태",
  cur_page: "페이지번호"
}
```

### 5. 비일관성비율 테이블 (consi_table)
- Matrix별 CR값 표시
- CR > 0.1: 빨간색 + "재평가 필요" 표시
- 클릭 시 해당 평가 페이지로 이동 (cur_page 기반)
- cs_ratio_change() 함수로 색상 적용

### 6. 평가 완료 (sign_checking)
- cell_and_total: "10/10" (완료 셀/전체 셀)
- 조건: 모든 셀 완료 + CR < 0.1 전부 통과
- CR > 0.1 존재 시: "비일관성비율이 0.1보다 높습니다" 경고
- 미완료 시: "모든 평가를 완료하지 못했습니다" 경고
- 완료 후: 관리자에게 데이터 전송, 수정 불가

### 7. Excel 저장 (Ex_save)
- jquery.wordexport.js + FileSaver.js 사용
- HTML 테이블 → Word 문서 형식 다운로드
- 포함 내용:
  1. 대안 하위요소의 종합중요도
  2. 대안의 종합중요도
  3. 기준의 종합중요도
  4. 수준별 기준의 중요도
  5. 기준별 대안의 중요도
  6. 대안별 하위요소의 중요도
  7. 비일관성비율

### 8. 하위대안 계산 (calcul_sub)
- 상위 대안 중요도 × 하위 대안 중요도 = 종합 중요도
- result_grape_alt_subes에 표시
- altdata3[x].Tooltip.split('，')로 하위대안 분리

### 9. 다음 프로젝트 이동 (go_next_pro)
- 평가중인 다른 프로젝트 자동 탐색
- lang_out(152)로 "평가중" 텍스트 매칭

## 핵심 API
```javascript
// 세부 결과 조회
par_ajax.asmx/par_result  { type: 1|2|3 }

// 모델 데이터 로드
makeit.asmx/load_model  { prjid: 3946 }
```

## UI 버튼
- 판단 내용 다시 보기 (ctl10$re_rating)
- 저장하기 Excel (Ex_save)
- 평가 완료 (ctl10$sign + sign_checking)
- 로그아웃 (ctl10$log_out_btn)

## React 변환 시 주요 매핑
| 원본 | React 구현 |
|------|-----------|
| par_result AJAX | Supabase query + Edge Function |
| Google OrgChart | React 트리 컴포넌트 |
| TreeView ASP.NET | React 트리뷰 (collapsible) |
| jquery.wordexport | xlsx 라이브러리 |
| FileSaver.js | file-saver npm 패키지 |
| graph_div 바 차트 | recharts BarChart |
| consi_table | ConsistencyTable 컴포넌트 |
| sign_checking | 평가완료 모달 + Supabase mutation |
| calcul_sub | 자체 계산 로직 (React state) |
