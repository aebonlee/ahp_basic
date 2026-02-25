import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useProject } from '../hooks/useProjects';
import { useEvaluators } from '../hooks/useEvaluators';
import { useCriteria } from '../hooks/useCriteria';
import { useAlternatives } from '../hooks/useAlternatives';
import { buildPageSequence } from '../lib/pairwiseUtils';
import ProjectLayout from '../components/layout/ProjectLayout';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpButton from '../components/common/HelpButton';
import common from '../styles/common.module.css';
import styles from './WorkshopPage.module.css';

export default function WorkshopPage() {
  const { id } = useParams();
  const { currentProject, loading: projLoading } = useProject(id);
  const { evaluators, loading: evalLoading } = useEvaluators(id);
  const { criteria, loading: critLoading } = useCriteria(id);
  const { alternatives, loading: altLoading } = useAlternatives(id);
  const [rawComparisons, setRawComparisons] = useState([]);

  const loadComparisons = useCallback(async () => {
    const { data } = await supabase
      .from('pairwise_comparisons')
      .select('evaluator_id, criterion_id, row_id, col_id')
      .eq('project_id', id);
    setRawComparisons(data || []);
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel(`workshop-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pairwise_comparisons',
        filter: `project_id=eq.${id}`,
      }, () => {
        loadComparisons();
      })
      .subscribe();

    loadComparisons();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadComparisons]);

  // Build page sequence and valid pair keys
  const { totalRequired, validKeys } = useMemo(() => {
    if (criteria.length === 0) return { totalRequired: 0, validKeys: new Set() };
    const pages = buildPageSequence(criteria, alternatives, id);
    const keys = new Set();
    for (const page of pages) {
      for (const pair of page.pairs) {
        keys.add(`${page.parentId}:${pair.left.id}:${pair.right.id}`);
      }
    }
    return { totalRequired: keys.size, validKeys: keys };
  }, [criteria, alternatives, id]);

  // Count only valid comparisons per evaluator (exclude orphaned DB rows)
  const progress = useMemo(() => {
    const counts = {};
    for (const row of rawComparisons) {
      const key = `${row.criterion_id}:${row.row_id}:${row.col_id}`;
      if (validKeys.has(key)) {
        counts[row.evaluator_id] = (counts[row.evaluator_id] || 0) + 1;
      }
    }
    return counts;
  }, [rawComparisons, validKeys]);

  if (projLoading || critLoading || altLoading || evalLoading) {
    return <ProjectLayout><LoadingSpinner /></ProjectLayout>;
  }

  return (
    <ProjectLayout projectName={currentProject?.name}>
      <h1 className={common.pageTitle}>
        실시간 워크숍 <HelpButton helpKey="workshopProgress" />
      </h1>

      <div className={common.card}>
        <h2 className={common.cardTitle}>평가자 진행 현황</h2>

        {evaluators.length === 0 ? (
          <p className={common.emptyText}>등록된 평가자가 없습니다.</p>
        ) : (
          <div className={styles.evalList}>
            {evaluators.map(ev => {
              const count = progress[ev.id] || 0;
              return (
                <div key={ev.id}>
                  <div className={styles.evalRow}>
                    <span className={styles.evalName}>{ev.name}</span>
                    <span className={ev.completed ? styles.evalStatusDone : styles.evalStatusPending}>
                      {count} / {totalRequired}{ev.completed ? ' (완료)' : ''}
                    </span>
                  </div>
                  <ProgressBar
                    value={count}
                    max={totalRequired || 1}
                    color={ev.completed ? 'var(--color-success)' : 'var(--color-primary)'}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProjectLayout>
  );
}
