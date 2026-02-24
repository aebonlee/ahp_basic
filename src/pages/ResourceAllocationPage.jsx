import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProject } from '../hooks/useProjects';
import { useAlternatives } from '../hooks/useAlternatives';
import { useCriteria } from '../hooks/useCriteria';
import { useEvaluation } from '../contexts/EvaluationContext';
import { buildPageSequence } from '../lib/pairwiseUtils';
import { calculateAHP } from '../lib/ahpEngine';
import ProjectLayout from '../components/layout/ProjectLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpButton from '../components/common/HelpButton';
import common from '../styles/common.module.css';
import styles from './ResourceAllocationPage.module.css';

/**
 * Calculate global weight of a criterion through the hierarchy.
 * Walks up the parent chain, multiplying local priorities at each level.
 */
function getCriteriaGlobal(criteria, criterionId, comparisons, goalId) {
  const criterion = criteria.find(c => c.id === criterionId);
  if (!criterion) return 0;

  // Build the chain from root to this criterion
  const chain = [];
  let current = criterion;
  while (current) {
    chain.unshift(current);
    current = criteria.find(c => c.id === current.parent_id);
  }

  let global = 1;
  for (const node of chain) {
    const parentId = node.parent_id || goalId;
    // Find siblings under same parent
    const siblings = criteria.filter(c => (c.parent_id || null) === (node.parent_id || null));
    if (siblings.length < 2) continue;

    const siblingIds = siblings.map(s => s.id);
    const values = {};
    for (let i = 0; i < siblingIds.length; i++) {
      for (let j = i + 1; j < siblingIds.length; j++) {
        const key = `${parentId}:${siblingIds[i]}:${siblingIds[j]}`;
        if (comparisons[key]) values[`${siblingIds[i]}:${siblingIds[j]}`] = comparisons[key];
      }
    }
    const result = calculateAHP(siblingIds, values);
    const idx = siblingIds.indexOf(node.id);
    global *= (result.priorities[idx] || 0);
  }

  return global;
}

export default function ResourceAllocationPage() {
  const { id } = useParams();
  const { currentProject, loading: projLoading } = useProject(id);
  const { criteria } = useCriteria(id);
  const { alternatives } = useAlternatives(id);
  const { comparisons, loadProjectData, loading } = useEvaluation();
  const [totalResource, setTotalResource] = useState(100);
  const [unit, setUnit] = useState('원');

  const UNIT_OPTIONS = [
    { value: '원', label: '금액(원)' },
    { value: '명', label: '인원(명)' },
    { value: 'h', label: '시간(h)' },
    { value: '%', label: '백분율(%)' },
  ];

  useEffect(() => {
    loadProjectData(id);
  }, [id, loadProjectData]);

  const allocations = useMemo(() => {
    if (criteria.length === 0 || alternatives.length === 0) return [];

    const mainAlts = alternatives.filter(a => !a.parent_id);
    const leafCriteria = criteria.filter(c => !criteria.some(other => other.parent_id === c.id));
    const altIds = mainAlts.map(a => a.id);

    return mainAlts.map(alt => {
      let totalScore = 0;
      for (const leaf of leafCriteria) {
        // Get global weight of this leaf criterion
        const criteriaGlobal = getCriteriaGlobal(criteria, leaf.id, comparisons, id);

        // Get alternative priority under this leaf
        const altValues = {};
        for (let i = 0; i < altIds.length; i++) {
          for (let j = i + 1; j < altIds.length; j++) {
            const key = `${leaf.id}:${altIds[i]}:${altIds[j]}`;
            if (comparisons[key]) altValues[`${altIds[i]}:${altIds[j]}`] = comparisons[key];
          }
        }
        const altResult = calculateAHP(altIds, altValues);
        const idx = altIds.indexOf(alt.id);
        totalScore += criteriaGlobal * (altResult.priorities[idx] || 0);
      }
      return { name: alt.name, score: totalScore };
    });
  }, [criteria, alternatives, comparisons]);

  const totalScore = allocations.reduce((sum, a) => sum + a.score, 0);

  const sortedAllocations = useMemo(() => {
    return [...allocations]
      .map(a => {
        const pct = totalScore > 0 ? a.score / totalScore : 0;
        return { ...a, pct, alloc: pct * totalResource };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [allocations, totalScore, totalResource]);

  const CHART_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

  const chartData = sortedAllocations.map(a => ({
    name: a.name,
    value: +(a.pct * 100).toFixed(2),
  }));

  if (projLoading || loading) return <ProjectLayout><LoadingSpinner /></ProjectLayout>;

  return (
    <ProjectLayout projectName={currentProject?.name}>
      <h1 className={common.pageTitle}>
        자원 배분 <HelpButton helpKey="resourceAllocation" />
      </h1>

      <div className={common.card}>
        <div className={styles.inputRow}>
          <label className={styles.inputLabel}>총 자원량:</label>
          <input
            type="number"
            value={totalResource}
            onChange={(e) => setTotalResource(Number(e.target.value) || 0)}
            className={styles.resourceInput}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={styles.unitSelect}
          >
            {UNIT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 수평 바 차트 */}
        {chartData.length > 0 && (
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 48, 120)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 대안별 카드 */}
        <div className={styles.allocCards}>
          {sortedAllocations.map((a, idx) => (
            <div key={a.name} className={styles.allocCard}>
              <div className={styles.allocRank}>
                <span className={styles.rankBadge} style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}>
                  {idx + 1}
                </span>
                <span className={styles.allocName}>{a.name}</span>
              </div>
              <div className={styles.allocBarTrack}>
                <div
                  className={styles.allocBarFill}
                  style={{
                    width: `${a.pct * 100}%`,
                    background: CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                />
              </div>
              <div className={styles.allocValues}>
                <span className={styles.allocPct}>{(a.pct * 100).toFixed(2)}%</span>
                <span className={styles.allocAmount}>
                  {a.alloc.toFixed(2)} {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 기존 테이블 */}
        <table className={common.dataTable} style={{ marginTop: 'var(--spacing-lg)' }}>
          <thead>
            <tr>
              <th>대안</th>
              <th style={{ textAlign: 'right' }}>중요도</th>
              <th style={{ textAlign: 'right' }}>배분량 ({unit})</th>
            </tr>
          </thead>
          <tbody>
            {sortedAllocations.map(a => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td className={styles.tdRight}>
                  {(a.pct * 100).toFixed(2)}%
                </td>
                <td className={styles.tdRightBold}>
                  {a.alloc.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={styles.tfootCell}>합계</td>
              <td className={`${styles.tfootCell} ${styles.tdRight}`}>100%</td>
              <td className={`${styles.tfootCell} ${styles.tdRightBold}`}>{totalResource}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </ProjectLayout>
  );
}
