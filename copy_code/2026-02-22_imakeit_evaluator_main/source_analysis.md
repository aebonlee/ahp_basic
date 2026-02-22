# 평가자 MODE 메인 페이지 소스 분석

## 페이지 정보
- **URL**: default.aspx?key=main (평가자 MODE)
- **페이지 타이틀**: 평가방법소개
- **역할**: 평가자가 접속 후 처음 보는 페이지, AHP 평가 방법 안내

## 관리자 MODE와의 차이
- header: 계정정보 없음, 문의/교육신청 + 로그아웃만
- mode_div: "현재 : 평가자 MODE" + "관리자 MODE로 이동"
- project_detail: 프로젝트 선택만 가능 (생성/수정/삭제 없음)
- parti_detail: 없음

## 핵심 UI 구성

### 1. AHP 평가 방법 안내 (#explain_total)
- 1:1 비교 평가 설명, 비일관성비율 기준치 체크
- 17단계 척도 테이블:

| 값 | 한국어 | 의미 |
|----|--------|------|
| 9 | 극히많이 | Extreme |
| 8 | 대단히많이 | Very Strong Plus |
| 7 | 아주많이 | Very Strong |
| 6 | 매우많이 | Strong Plus |
| 5 | 많이 | Strong |
| 4 | 상당히 | Moderate Plus |
| 3 | 약간 | Moderate |
| 2 | 조금 | Weak |
| 1 | 동등 | Equal |

### 2. 다국어 지원 시스템
- `<dsdata class='lang' data-id='XX'>텍스트</dsdata>` 패턴
- lan.js 외부 스크립트로 언어 변환
- `lang_out(코드, 언어)` / `change_lang("ko")`
- sessionStorage("lang")에 언어 설정 저장

### 3. 평가 관련 핵심 JavaScript
- `btn_ajax_ssang()`: 쌍대비교 실시간 저장
- `direct_save()`: 직접입력 저장
- `cr_check()`: 비일관성비율(CR) 체크 (임계값 0.1)
- `bestfiter()`: 판단 도우미 (best fit 추천)
- `makeBestFit()`: 추천 셀 깜빡임 표시
- `draw_graph()`: 중요도 그래프 그리기

## 핵심 API (평가자 MODE)
```javascript
// 쌍대비교 저장
par_ajax.asmx/btn_save_ssang
data: { cri_st, cri_nd, row, col, val }
returns: { pri: [중요도배열], cr: 비일관성비율, best: [추천배열] }

// 직접입력 저장
par_ajax.asmx/btn_save_direct
data: { val: "값1,값2,..." }
returns: [중요도배열]

// 마지막 셀/대안 저장
par_ajax.asmx/last_cell
par_ajax.asmx/last_alt_save
```

## React 변환 시 주요 매핑
| 원본 | React 구현 |
|------|-----------|
| dsdata 다국어 | i18n (react-i18next) |
| ahp_rating 셀 그리드 | PairwiseComparisonGrid 컴포넌트 |
| graph_data 그래프 | PriorityBarChart 컴포넌트 |
| bestfiter 판단 도우미 | ConsistencyHelper 컴포넌트 |
| par_ajax.asmx | Supabase Edge Functions |
