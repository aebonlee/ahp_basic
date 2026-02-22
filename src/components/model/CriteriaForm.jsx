import { useState } from 'react';
import { EVAL_METHOD, EVAL_METHOD_LABELS } from '../../lib/constants';
import Modal from '../common/Modal';
import Button from '../common/Button';
import styles from './CriteriaForm.module.css';

export default function CriteriaForm({ mode, criterion, parentName, onSubmit, onClose }) {
  const [name, setName] = useState(criterion?.name || '');
  const [description, setDescription] = useState(criterion?.description || '');
  const [evalMethod, setEvalMethod] = useState(criterion?.eval_method || EVAL_METHOD.PAIRWISE_PRACTICAL);
  const [loading, setLoading] = useState(false);

  const titles = {
    add: '기준 추가',
    edit: '기준 수정',
    addChild: `하위기준 추가 (${parentName})`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name, description, eval_method: evalMethod });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={titles[mode]}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>기준명</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 가격, 성능, 디자인" autoFocus />
        </label>
        <label className={styles.field}>
          <span>설명</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="제3자도 이해할 수 있는 설명" rows={2} />
        </label>
        <label className={styles.field}>
          <span>평가방법</span>
          <select value={evalMethod} onChange={(e) => setEvalMethod(Number(e.target.value))}>
            {Object.entries(EVAL_METHOD).map(([key, val]) => (
              <option key={val} value={val}>{EVAL_METHOD_LABELS[val]}</option>
            ))}
          </select>
        </label>
        <div className={styles.actions}>
          <Button type="submit" loading={loading}>{mode === 'edit' ? '수정' : '추가'}</Button>
          <Button variant="secondary" onClick={onClose}>취소</Button>
        </div>
      </form>
    </Modal>
  );
}
