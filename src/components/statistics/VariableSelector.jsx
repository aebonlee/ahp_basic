/**
 * 통계분석 변수 선택 UI
 * 분석 유형에 따라 적절한 변수 선택 폼 표시
 */
import { useState } from 'react';
import styles from './VariableSelector.module.css';

const ANALYSIS_CONFIG = {
  descriptive: {
    title: '기술통계',
    help: '선택한 변수의 평균, 중앙값, 표준편차 등 기본 통계량을 산출합니다.',
    fields: [{ key: 'variable', label: '분석 변수', type: 'numeric', multi: false }],
  },
  independentT: {
    title: '독립표본 T검정',
    help: '두 독립 집단(예: 남/여)의 평균을 비교합니다. 그룹 변수는 2개 범주를 가진 범주형 변수여야 합니다.',
    fields: [
      { key: 'groupVar', label: '그룹 변수 (2집단)', type: 'categorical', multi: false },
      { key: 'testVar', label: '검정 변수', type: 'numeric', multi: false },
    ],
  },
  pairedT: {
    title: '대응표본 T검정',
    help: '동일 대상의 두 시점/조건(예: 사전-사후) 평균을 비교합니다. 두 변수의 응답자 수가 같아야 합니다.',
    fields: [
      { key: 'var1', label: '변수 1 (사전/조건A)', type: 'numeric', multi: false },
      { key: 'var2', label: '변수 2 (사후/조건B)', type: 'numeric', multi: false },
    ],
  },
  anova: {
    title: '일원분산분석 (ANOVA)',
    help: '3개 이상 집단의 평균 차이를 비교합니다. 유의하면 사후검정(Bonferroni)으로 어떤 쌍이 다른지 확인합니다.',
    fields: [
      { key: 'groupVar', label: '그룹 변수 (3+집단)', type: 'categorical', multi: false },
      { key: 'testVar', label: '검정 변수', type: 'numeric', multi: false },
    ],
  },
  chiSquare: {
    title: '카이제곱 검정',
    help: '두 범주형 변수 간 독립성(연관성)을 검정합니다. 두 변수 모두 범주형이어야 합니다.',
    fields: [
      { key: 'var1', label: '변수 1 (범주형)', type: 'categorical', multi: false },
      { key: 'var2', label: '변수 2 (범주형)', type: 'categorical', multi: false },
    ],
  },
  correlation: {
    title: '상관분석',
    help: '선택한 수치 변수들 간의 Pearson 상관계수를 계산하여 선형 관계를 파악합니다.',
    fields: [{ key: 'variables', label: '분석 변수 (2개 이상)', type: 'numeric', multi: true }],
  },
  regression: {
    title: '단순선형회귀',
    help: '독립변수(X)로 종속변수(Y)를 예측하는 회귀식을 구합니다. 두 변수 모두 수치형이어야 합니다.',
    fields: [
      { key: 'xVar', label: '독립변수 (X) \u2014 예측에 사용', type: 'numeric', multi: false },
      { key: 'yVar', label: '종속변수 (Y) \u2014 예측 대상', type: 'numeric', multi: false },
    ],
  },
  cronbach: {
    title: '크론바흐 알파',
    help: '같은 척도(리커트)의 문항들이 내적으로 일관되게 측정하는지 신뢰도를 분석합니다.',
    fields: [{ key: 'items', label: '리커트 문항 (2개 이상)', type: 'numeric', multi: true }],
  },
  crossTab: {
    title: '교차분석',
    help: '두 범주형 변수의 빈도, 비율, 기대빈도, 잔차를 상세히 분석합니다.',
    fields: [
      { key: 'var1', label: '행 변수 (범주형)', type: 'categorical', multi: false },
      { key: 'var2', label: '열 변수 (범주형)', type: 'categorical', multi: false },
    ],
  },
  spearman: {
    title: 'Spearman 순위상관',
    help: '순위 기반 비모수 상관분석입니다. 비정규 데이터나 순서형 변수에 적합합니다.',
    fields: [{ key: 'variables', label: '분석 변수 (2개 이상)', type: 'numeric', multi: true }],
  },
};

export default function VariableSelector({
  analysisType,
  variables,
  onRun,
  onBack,
  responseCounts,
}) {
  const config = ANALYSIS_CONFIG[analysisType];
  const [selections, setSelections] = useState({});

  if (!config) return null;

  const handleChange = (key, value, multi) => {
    if (multi) {
      setSelections(prev => {
        const current = prev[key] || [];
        const exists = current.includes(value);
        return {
          ...prev,
          [key]: exists ? current.filter(v => v !== value) : [...current, value],
        };
      });
    } else {
      setSelections(prev => ({ ...prev, [key]: value }));
    }
  };

  const isValid = () => {
    for (const field of config.fields) {
      const val = selections[field.key];
      if (field.multi) {
        if (!val || val.length < 2) return false;
      } else {
        if (!val) return false;
      }
    }
    return true;
  };

  const getOptions = (type) => {
    if (type === 'numeric') return variables.numeric;
    if (type === 'categorical') return variables.categorical;
    return variables.all;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>&larr; 돌아가기</button>
        <h2 className={styles.title}>{config.title}</h2>
        {config.help && <p className={styles.helpText}>{config.help}</p>}
        <p className={styles.subtitle}>분석에 사용할 변수를 선택하세요</p>
      </div>

      <div className={styles.fieldsWrap}>
        {config.fields.map(field => {
          const options = getOptions(field.type);
          return (
            <div key={field.key} className={styles.field}>
              <label className={styles.fieldLabel}>{field.label}</label>
              {field.multi ? (
                <div className={styles.checkboxGroup}>
                  {options.length === 0 && (
                    <p className={styles.noVars}>
                      {field.type === 'numeric' ? '수치/리커트형' : '범주형'} 변수가 없습니다
                    </p>
                  )}
                  {options.map(opt => (
                    <label key={opt.id} className={styles.checkItem}>
                      <input
                        type="checkbox"
                        checked={(selections[field.key] || []).includes(opt.id)}
                        onChange={() => handleChange(field.key, opt.id, true)}
                      />
                      <span>{opt.label}</span>
                      {responseCounts?.[opt.id] !== undefined && (
                        <span className={styles.respCount}>({responseCounts[opt.id]}명)</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <select
                  className={styles.select}
                  value={selections[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value, false)}
                >
                  <option value="">-- 선택 --</option>
                  {options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}{responseCounts?.[opt.id] !== undefined ? ` (${responseCounts[opt.id]}명)` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.runBtn}
          onClick={() => onRun(selections)}
          disabled={!isValid()}
          title={!isValid() ? '모든 변수를 선택해주세요 (다중 선택은 2개 이상)' : ''}
        >
          분석 실행
        </button>
        {!isValid() && (
          <p className={styles.hint}>모든 변수를 선택해주세요</p>
        )}
      </div>
    </div>
  );
}
