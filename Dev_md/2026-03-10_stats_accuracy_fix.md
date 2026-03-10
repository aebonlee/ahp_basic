# 통계 분석 엔진 정확도 개선

## 날짜
2026-03-10

## 개요
연구자용 통계 분석 엔진(`statsEngine.js`, `statsDistributions.js`)의 계산 정확도를 학술 수준으로 개선했다.
기존에 근사값이나 고정값을 사용하던 부분을 정확한 분포 함수 기반으로 교체했다.

## 수정 내용

### 1. t분포 역함수 추가 (`statsDistributions.js`)

**문제**: 95% 신뢰구간(CI) 계산 시 t-critical 값을 `df >= 30 ? 1.96 : 2.045`로 고정.
- n=5일 때 실제 t(4, 0.025) = 2.776이지만 코드는 2.045 사용 → CI가 좁아짐

**해결**: `tCritical(alpha, df)` 함수 신규 추가
- `tCDF(t, df)`에 대한 이진탐색(bisection) 80회 반복
- 정밀도: ~10⁻²⁴ 수준
- `tCDF(mid, df) > alpha`이면 lo 이동, 아니면 hi 이동

### 2. 분위수 계산 선형보간 (`statsEngine.js`)

**문제**: `quartiles()` 함수가 `Math.floor(n * 0.25)` 사용 → 이산적 값 반환.
- SPSS, Excel, R (type 7)과 결과 불일치

**해결**: `percentile(sorted, p)` 함수 추가
- R type 7 / Excel PERCENTILE.INC 방식 선형보간
- `pos = p * (n-1)`, `lo = floor(pos)`, `frac = pos - lo`
- `result = sorted[lo] + frac * (sorted[hi] - sorted[lo])`
- `quartiles()`, `detectOutliers()` 모두 이 함수 사용

### 3. Jarque-Bera 정규성 검정 추가

**문제**: 정규성 판단이 왜도/첨도 경험적 기준(`|S| < 2`, `|K| < 7`)에만 의존.
- 공식 검정 통계량 없음 → 논문에서 인용 불가

**해결**: 기술통계(`descriptiveStats`)에 Jarque-Bera 검정 추가
- `JB = (n/6) * (S² + K²/4)`, JB ~ χ²(2)
- p값: `chiSquaredCDF(JB, 2)` (이미 구현된 함수 활용)
- n < 8일 때 "표본 부족" 경고
- 결과 라벨: "정규성 기각 (p < .05) — 비모수 검정 권장" / "정규성 충족 (p ≥ .05)"

### 4. 95% CI 정확도 개선 (3개 함수)

| 함수 | 기존 | 수정 |
|---|---|---|
| `descriptiveStats` | `n > 1 ? tCritical(0.05, df) : 1.96` | 동일 (이번에 추가) |
| `independentTTest` | `df >= 30 ? 1.96 : 2.045` | `tCritical(0.05, df)` |
| `pairedTTest` | `df >= 30 ? 1.96 : 2.045` | `tCritical(0.05, df)` |

### 5. 수정하지 않은 부분 (이미 정확)

- **ANOVA**: F분포 p값 `fCDF()` 사용 — 정확
- **카이제곱 검정**: `chiSquaredCDF()` 사용 — 정확
- **상관분석**: Pearson r → t통계량 → `tCDF()` — 정확
- **Spearman**: 순위 변환 후 Pearson 적용 — 정확
- **선형회귀**: `tCDF()`, `fCDF()`, Durbin-Watson — 정확
- **크론바흐 알파**: 분산 기반 계산 — 정확
- **교차분석**: 조정잔차 z=1.96 (표준정규) — 정확

## 영향 범위
- 통계 분석 페이지(`/admin/project/:id/stats`)의 모든 수치형 분석
- 기술통계, 독립표본 T검정, 대응표본 T검정의 95% CI 값 변경
- 기술통계의 정규성 검정 결과 추가
- 기존 사용자에게는 더 정확한 결과 표시 (값이 약간 달라질 수 있음)

## 수정 파일
- `src/lib/statsDistributions.js` — `tCritical()` 함수 추가
- `src/lib/statsEngine.js` — CI 계산, 분위수, Jarque-Bera 검정 개선
