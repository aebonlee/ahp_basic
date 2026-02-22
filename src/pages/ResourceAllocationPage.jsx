import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useAlternatives } from '../hooks/useAlternatives';
import { useCriteria } from '../hooks/useCriteria';
import { useEvaluation } from '../contexts/EvaluationContext';
import { buildPageSequence } from '../lib/pairwiseUtils';
import { calculateAHP } from '../lib/ahpEngine';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ResourceAllocationPage() {
  const { id } = useParams();
  const { currentProject, loading: projLoading } = useProject(id);
  const { criteria } = useCriteria(id);
  const { alternatives } = useAlternatives(id);
  const { comparisons, loadProjectData, loading } = useEvaluation();
  const [totalResource, setTotalResource] = useState(100);

  useEffect(() => {
    loadProjectData(id);
  }, [id, loadProjectData]);

  const allocations = useMemo(() => {
    if (criteria.length === 0 || alternatives.length === 0) return [];

    const pages = buildPageSequence(criteria, alternatives);
    const mainAlts = alternatives.filter(a => !a.parent_id);
    const leafCriteria = criteria.filter(c => !criteria.some(other => other.parent_id === c.id));

    return mainAlts.map(alt => {
      let totalScore = 0;
      for (const leaf of leafCriteria) {
        const altIds = mainAlts.map(a => a.id);
        const altValues = {};
        for (let i = 0; i < altIds.length; i++) {
          for (let j = i + 1; j < altIds.length; j++) {
            const key = `${leaf.id}:${altIds[i]}:${altIds[j]}`;
            if (comparisons[key]) altValues[`${altIds[i]}:${altIds[j]}`] = comparisons[key];
          }
        }
        const altResult = calculateAHP(altIds, altValues);
        const idx = altIds.indexOf(alt.id);
        totalScore += (altResult.priorities[idx] || 0);
      }
      return { name: alt.name, score: totalScore };
    });
  }, [criteria, alternatives, comparisons]);

  const totalScore = allocations.reduce((sum, a) => sum + a.score, 0);

  if (projLoading || loading) return <PageLayout><LoadingSpinner /></PageLayout>;

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>
        {currentProject?.name} - 자원 배분
      </h1>

      <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>총 자원량:</label>
          <input
            type="number"
            value={totalResource}
            onChange={(e) => setTotalResource(Number(e.target.value) || 0)}
            style={{ width: 100, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4 }}
          />
        </div>

        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid var(--color-border)' }}>대안</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid var(--color-border)' }}>중요도</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid var(--color-border)' }}>배분량</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map(a => {
              const pct = totalScore > 0 ? a.score / totalScore : 0;
              const alloc = pct * totalResource;
              return (
                <tr key={a.name}>
                  <td style={{ padding: 8, borderBottom: '1px solid var(--color-border)' }}>{a.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontFamily: 'monospace' }}>
                    {(pct * 100).toFixed(2)}%
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 600 }}>
                    {alloc.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: 8, fontWeight: 600 }}>합계</td>
              <td style={{ padding: 8, textAlign: 'right' }}>100%</td>
              <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{totalResource}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </PageLayout>
  );
}
