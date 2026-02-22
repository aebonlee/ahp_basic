import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useProject } from '../hooks/useProjects';
import { useEvaluators } from '../hooks/useEvaluators';
import { useCriteria } from '../hooks/useCriteria';
import { useAlternatives } from '../hooks/useAlternatives';
import { aggregateComparisons } from '../lib/ahpAggregation';
import { aggregateDirectInputs } from '../lib/directInputEngine';
import { buildPageSequence } from '../lib/pairwiseUtils';
import { EVAL_METHOD, CR_THRESHOLD } from '../lib/constants';
import PageLayout from '../components/layout/PageLayout';
import ComprehensiveChart from '../components/results/ComprehensiveChart';
import ConsistencyTable from '../components/results/ConsistencyTable';
import EvaluatorWeightEditor from '../components/admin/EvaluatorWeightEditor';
import ExportButtons from '../components/results/ExportButtons';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminResultPage() {
  const { id } = useParams();
  const { currentProject, loading: projLoading } = useProject(id);
  const { evaluators } = useEvaluators(id);
  const { criteria } = useCriteria(id);
  const { alternatives } = useAlternatives(id);
  const [allComparisons, setAllComparisons] = useState({});
  const [allDirectInputs, setAllDirectInputs] = useState({});
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [id, evaluators]);

  const loadAllData = async () => {
    if (!evaluators.length) return;

    const [compRes, directRes] = await Promise.all([
      supabase.from('pairwise_comparisons').select('*').eq('project_id', id),
      supabase.from('direct_input_values').select('*').eq('project_id', id),
    ]);

    // Pairwise comparisons by evaluator
    const byEval = {};
    for (const c of (compRes.data || [])) {
      if (!byEval[c.evaluator_id]) byEval[c.evaluator_id] = {};
      byEval[c.evaluator_id][`${c.criterion_id}:${c.row_id}:${c.col_id}`] = c.value;
    }
    setAllComparisons(byEval);

    // Direct input values by evaluator
    const directByEval = {};
    for (const d of (directRes.data || [])) {
      if (!directByEval[d.evaluator_id]) directByEval[d.evaluator_id] = {};
      if (!directByEval[d.evaluator_id][d.criterion_id]) directByEval[d.evaluator_id][d.criterion_id] = {};
      directByEval[d.evaluator_id][d.criterion_id][d.item_id] = d.value;
    }
    setAllDirectInputs(directByEval);

    // Initialize equal weights
    const w = {};
    evaluators.forEach(e => { w[e.id] = 1; });
    setWeights(w);
    setLoading(false);
  };

  const isDirectInput = currentProject?.eval_method === EVAL_METHOD.DIRECT_INPUT;

  const results = useMemo(() => {
    if (criteria.length === 0) return null;
    if (!isDirectInput && Object.keys(allComparisons).length === 0) return null;
    if (isDirectInput && Object.keys(allDirectInputs).length === 0) return null;

    const pageSequence = buildPageSequence(criteria, alternatives);
    const pageResults = {};

    let totalCells = 0;
    let completedCells = 0;
    let allConsistent = true;

    for (const page of pageSequence) {
      const itemIds = page.items.map(i => i.id);

      if (isDirectInput) {
        // Direct input aggregation
        const evalValues = Object.entries(allDirectInputs).map(([evalId, critValues]) => {
          const values = critValues[page.parentId] || {};
          return { values, weight: weights[evalId] || 1 };
        });

        const agg = aggregateDirectInputs(itemIds, evalValues);
        pageResults[page.parentId] = { ...page, ...agg };

        // Track completeness for direct input
        for (const evalId of Object.keys(allDirectInputs)) {
          totalCells += itemIds.length;
          const critValues = allDirectInputs[evalId]?.[page.parentId] || {};
          completedCells += itemIds.filter(iid => critValues[iid] > 0).length;
        }
      } else {
        // Pairwise comparison aggregation
        const expectedPairs = (itemIds.length * (itemIds.length - 1)) / 2;

        const evalValues = Object.entries(allComparisons).map(([evalId, comps]) => {
          const values = {};
          let evalCompletedPairs = 0;
          for (let i = 0; i < itemIds.length; i++) {
            for (let j = i + 1; j < itemIds.length; j++) {
              const key = `${page.parentId}:${itemIds[i]}:${itemIds[j]}`;
              if (comps[key]) {
                values[`${itemIds[i]}:${itemIds[j]}`] = comps[key];
                evalCompletedPairs++;
              }
            }
          }

          totalCells += expectedPairs;
          completedCells += evalCompletedPairs;

          return { values, weight: weights[evalId] || 1 };
        });

        const agg = aggregateComparisons(itemIds, evalValues);
        pageResults[page.parentId] = { ...page, ...agg };

        if (agg.cr > CR_THRESHOLD) {
          allConsistent = false;
        }
      }
    }

    const allComplete = totalCells > 0 && completedCells >= totalCells;

    return { pageResults, pageSequence, allConsistent, allComplete, totalCells, completedCells };
  }, [criteria, alternatives, allComparisons, allDirectInputs, weights, isDirectInput]);

  if (projLoading || loading) {
    return <PageLayout><LoadingSpinner message="집계 결과 로딩 중..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>
        {currentProject?.name} - 집계 결과
      </h1>

      <EvaluatorWeightEditor
        evaluators={evaluators}
        weights={weights}
        onChange={setWeights}
      />

      {results && (
        <>
          <div style={{ margin: '16px 0', padding: 12, borderRadius: 8, background: results.allComplete && results.allConsistent ? 'var(--color-success-bg, #f0fff4)' : 'var(--color-warning-bg, #fffbeb)', fontSize: '0.85rem' }}>
            <p>
              완료: {results.completedCells}/{results.totalCells} ({results.totalCells > 0 ? ((results.completedCells / results.totalCells) * 100).toFixed(0) : 0}%)
              {!results.allComplete && <span style={{ color: 'var(--color-warning)', marginLeft: 8 }}>미완료 항목이 있습니다</span>}
            </p>
            {!isDirectInput && (
              <p>
                일관성: {results.allConsistent ? '모두 통과' : 'CR > 0.1인 페이지가 있습니다'}
              </p>
            )}
          </div>
          <div style={{ marginTop: 24 }}>
            <ExportButtons criteria={criteria} alternatives={alternatives} results={results} />
          </div>
          <div style={{ marginTop: 24 }}>
            <ComprehensiveChart criteria={criteria} alternatives={alternatives} results={results} />
          </div>
          <div style={{ marginTop: 24 }}>
            <ConsistencyTable results={results} onNavigateToPage={() => {}} />
          </div>
        </>
      )}
    </PageLayout>
  );
}
