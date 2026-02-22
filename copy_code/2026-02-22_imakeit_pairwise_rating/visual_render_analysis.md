# 쌍대비교 평가 페이지 비주얼 렌더 분석

## 개요
사용자가 제공한 인라인 스타일 기반 렌더링 소스로부터 추출한 CSS 패턴 및 실제 데이터

## 반응형 브레이크포인트
- Mobile: max-width 768px
- Desktop: min-width 769px

## 핵심 CSS 패턴

### 평가 셀 그라데이션
- 왼쪽(파랑): background-color: #38d; linear-gradient(to top, #38d N%, #eee N%)
- 오른쪽(빨강): background-color: #e77; linear-gradient(to top, #e77 N%, #eee N%)
- 동등: background-color: #eee
- 선택된 셀: background-color: rgba(30, 250, 200, 0.3); border-color: #009

### 셀 크기
- Desktop: 30px x 30px (기준명 180px)
- Mobile: 17px x 17px (기준명 95px)

### 그래프 색상
- 중요도 바: background-color: #3a2 (초록)
- 레이아웃: 기준명(text-align:right) + 바 + 퍼센트

### 페이지 네비게이션
- 이전/다음: 배경 화살표 이미지 (left.png/right.png)
- 진행도 바: linear-gradient(to right, #efefef N%, #fff N%)

### Header
- 그라데이션: linear-gradient(to top, #bde4f7 0%, #fff 6%)
- border-radius: 50px
- Desktop: width 960px, height 100px
- Mobile: fixed, height 30px

### Mode Switch
- 색상: #393 (초록)
- 현재 모드: text-align center
- 전환 버튼: border-top 2px solid #000

## 데이터 확인 (비주얼 렌더에서 추출)

### 페이지 2/6: 창의력 하위 (자료 검색 vs 사고력)
- 자료 검색: 20%
- 사고력: 80%
- 선택: 사고력이 상당히(4) 더 중요

### 페이지 3/6: 분석능력 하위 (데이터 분석 vs 수치 분석)
- 데이터 분석: 83.333%
- 수치 분석: 16.667%
- 선택: 데이터 분석이 많이(5) 더 중요

## 평가결과 페이지 비주얼 렌더 데이터
- 기준 종합중요도 (레벨별 색상):
  - 1차 기준: #a0a (보라)
  - 2차 기준: #0aa (시안)
- 비일관성비율 테이블:
  - 대학원생의 연구역량: 0.05787 (통과)
  - 창의력: - (2개 하위, CR 불필요)
  - 분석능력: - (2개 하위, CR 불필요)
  - 기술능력: - (2개 하위, CR 불필요)
  - 문제 해결능력: - (2개 하위, CR 불필요)
