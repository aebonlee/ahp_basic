import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Button from '../common/Button';
import styles from '../../styles/results.module.css';

export default function SignaturePanel({ projectId, evaluatorId, allComplete, allConsistent, completedCells, totalCells }) {
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSign = allComplete && allConsistent;

  const handleSign = async () => {
    if (!canSign) {
      if (!allComplete) alert('모든 평가를 완료하지 못했습니다.');
      else if (!allConsistent) alert('비일관성비율이 0.1보다 높은 항목이 있습니다.');
      return;
    }

    if (!window.confirm('평가를 완료하시겠습니까? 완료 후에는 수정할 수 없습니다.')) return;

    setLoading(true);
    try {
      await supabase.from('evaluation_signatures').insert({
        project_id: projectId,
        evaluator_id: evaluatorId,
        signed_at: new Date().toISOString(),
      });
      await supabase.from('evaluators')
        .update({ completed: true })
        .eq('project_id', projectId)
        .eq('user_id', evaluatorId);
      setSigned(true);
    } catch (err) {
      alert('완료 처리 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signaturePanel}>
      <div className={styles.signatureInfo}>
        <span>평가 진행: {completedCells}/{totalCells}</span>
        {!allConsistent && <span className={styles.warn}>비일관성 항목이 있습니다</span>}
      </div>
      {signed ? (
        <div className={styles.signedMsg}>평가가 완료되었습니다.</div>
      ) : (
        <Button
          variant={canSign ? 'success' : 'secondary'}
          disabled={!canSign}
          loading={loading}
          onClick={handleSign}
        >
          평가 완료
        </Button>
      )}
    </div>
  );
}
