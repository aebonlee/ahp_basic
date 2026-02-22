import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvaluation } from '../contexts/EvaluationContext';
import { useAuth } from '../hooks/useAuth';
import { buildPageSequence } from '../lib/pairwiseUtils';
import { calculateDirectPriorities } from '../lib/directInputEngine';
import PageLayout from '../components/layout/PageLayout';
import DirectInputPanel from '../components/evaluation/DirectInputPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

export default function DirectInputPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { criteria, alternatives, loading, loadProjectData, directInputValues } = useEvaluation();
  const [validations, setValidations] = useState({});

  useEffect(() => {
    loadProjectData(id);
  }, [id, loadProjectData]);

  const pages = useMemo(
    () => buildPageSequence(criteria, alternatives),
    [criteria, alternatives]
  );

  const handleValidationChange = useCallback((criterionId, isComplete) => {
    setValidations(prev => ({ ...prev, [criterionId]: isComplete }));
  }, []);

  const allComplete = pages.length > 0 && pages.every(p => validations[p.parentId]);

  // Calculate priorities for display
  const pagePriorities = useMemo(() => {
    const result = {};
    for (const page of pages) {
      const itemIds = page.items.map(i => i.id);
      const vals = {};
      for (const item of page.items) {
        vals[item.id] = directInputValues?.[`${page.parentId}:${item.id}`] || 0;
      }
      result[page.parentId] = calculateDirectPriorities(itemIds, vals);
    }
    return result;
  }, [pages, directInputValues]);

  if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>직접입력 평가</h1>
      {pages.map(page => {
        const priorities = pagePriorities[page.parentId];
        return (
          <div key={page.parentId} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{page.parentName}</h3>
            <DirectInputPanel
              projectId={id}
              evaluatorId={user?.id}
              criterionId={page.parentId}
              items={page.items}
              onValidationChange={handleValidationChange}
            />
            {priorities && priorities.priorities.some(p => p > 0) && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 6 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>우선순위 미리보기</p>
                {page.items.map((item, idx) => {
                  const pct = (priorities.priorities[idx] * 100).toFixed(1);
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.82rem', minWidth: 80 }}>{item.name}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', minWidth: 45, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <Button
        onClick={() => navigate(`/eval/project/${id}/result`)}
        disabled={!allComplete}
      >
        {allComplete ? '결과 보기' : '모든 항목을 입력해주세요'}
      </Button>
    </PageLayout>
  );
}
