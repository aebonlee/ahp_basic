import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useProject } from '../hooks/useProjects';
import { useEvaluators } from '../hooks/useEvaluators';
import { useCriteria } from '../hooks/useCriteria';
import { useAlternatives } from '../hooks/useAlternatives';
import { aggregateComparisons } from '../lib/ahpAggregation';
import { buildPageSequence } from '../lib/pairwiseUtils';
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
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllComparisons();
  }, [id, evaluators]);

  const loadAllComparisons = async () => {
    if (!evaluators.length) return;
    const { data } = await supabase
      .from('pairwise_comparisons')
      .select('*')
      .eq('project_id', id);

    const byEval = {};
    for (const c of (data || [])) {
      if (!byEval[c.evaluator_id]) byEval[c.evaluator_id] = {};
      byEval[c.evaluator_id][`${c.criterion_id}:${c.row_id}:${c.col_id}`] = c.value;
    }
    setAllComparisons(byEval);

    // Initialize equal weights
    const w = {};
    evaluators.forEach(e => { w[e.id] = 1; });
    setWeights(w);
    setLoading(false);
  };

  const results = useMemo(() => {
    if (criteria.length === 0 || Object.keys(allComparisons).length === 0) return null;

    const pageSequence = buildPageSequence(criteria, alternatives);
    const pageResults = {};

    for (const page of pageSequence) {
      const itemIds = page.items.map(i => i.id);

      const evalValues = Object.entries(allComparisons).map(([evalId, comps]) => {
        const values = {};
        for (let i = 0; i < itemIds.length; i++) {
          for (let j = i + 1; j < itemIds.length; j++) {
            const key = `${page.parentId}:${itemIds[i]}:${itemIds[j]}`;
            if (comps[key]) {
              values[`${itemIds[i]}:${itemIds[j]}`] = comps[key];
            }
          }
        }
        return { values, weight: weights[evalId] || 1 };
      });

      const agg = aggregateComparisons(itemIds, evalValues);
      pageResults[page.parentId] = { ...page, ...agg };
    }

    return { pageResults, pageSequence, allConsistent: true, allComplete: true, totalCells: 0, completedCells: 0 };
  }, [criteria, alternatives, allComparisons, weights]);

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
