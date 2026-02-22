import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import styles from './CriteriaForm.module.css';

export default function AlternativeForm({ mode, alternative, parentName, onSubmit, onClose }) {
  const [name, setName] = useState(alternative?.name || '');
  const [description, setDescription] = useState(alternative?.description || '');
  const [loading, setLoading] = useState(false);

  const titles = {
    add: '대안 추가',
    edit: '대안 수정',
    addSub: `하위대안 추가 (${parentName})`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name, description });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={titles[mode]}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>대안명</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 현대 소나타, 기아 K5" autoFocus />
        </label>
        <label className={styles.field}>
          <span>설명</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="대안 상세 정보" rows={2} />
        </label>
        <div className={styles.actions}>
          <Button type="submit" loading={loading}>{mode === 'edit' ? '수정' : '추가'}</Button>
          <Button variant="secondary" onClick={onClose}>취소</Button>
        </div>
      </form>
    </Modal>
  );
}
