import { useState, useMemo, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatPhone } from '../../lib/evaluatorUtils';
import { getByteInfo } from '../../lib/smsUtils';
import { sendSmsBulk } from '../../lib/smsService';
import styles from './SmsModal.module.css';

export default function SmsModal({ isOpen, onClose, evaluators, projectId }) {
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);

  // 전화번호 있는 평가자만 선택 가능
  const selectableEvaluators = useMemo(
    () => evaluators.filter((ev) => ev.phone_number),
    [evaluators]
  );

  const byteInfo = useMemo(() => getByteInfo(message), [message]);

  const handleToggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === selectableEvaluators.length) return new Set();
      return new Set(selectableEvaluators.map((ev) => ev.id));
    });
  }, [selectableEvaluators]);

  const handleSend = async () => {
    if (selected.size === 0 || !message.trim()) return;
    if (byteInfo.type === 'OVER') return;

    const recipients = selectableEvaluators
      .filter((ev) => selected.has(ev.id))
      .map((ev) => ({ name: ev.name, phone: ev.phone_number }));

    setSending(true);
    setProgress({ current: 0, total: recipients.length });
    setResults(null);

    const res = await sendSmsBulk(recipients, message, (current, total) => {
      setProgress({ current, total });
    });

    setResults(res);
    setSending(false);
  };

  const handleClose = () => {
    if (sending) return;
    setResults(null);
    onClose();
  };

  const selectedCount = selected.size;
  const allSelected =
    selectableEvaluators.length > 0 &&
    selectedCount === selectableEvaluators.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="SMS 발송" width="480px">
      {results ? (
        <div className={styles.results}>
          <h4 className={styles.resultsTitle}>발송 결과</h4>
          <ul className={styles.resultsList}>
            {results.map((r, i) => (
              <li key={i} className={r.success ? styles.resultSuccess : styles.resultFail}>
                <span>{r.name}</span>
                <span>{formatPhone(r.phone)}</span>
                <span className={r.success ? styles.badgeSuccess : styles.badgeFail}>
                  {r.success ? '성공' : '실패'}
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.resultsSummary}>
            성공 {results.filter((r) => r.success).length}건 / 실패{' '}
            {results.filter((r) => !r.success).length}건
          </div>
          <div className={styles.actions}>
            <Button onClick={handleClose}>닫기</Button>
          </div>
        </div>
      ) : (
        <>
          {/* 수신자 선택 */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>수신자 선택</label>
            <div className={styles.recipientList}>
              <label className={styles.recipientRow}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  disabled={sending}
                />
                <span className={styles.recipientName}>
                  전체 선택 ({selectedCount}/{selectableEvaluators.length}명)
                </span>
              </label>
              {evaluators.map((ev) => {
                const hasPhone = !!ev.phone_number;
                return (
                  <label
                    key={ev.id}
                    className={`${styles.recipientRow} ${!hasPhone ? styles.disabled : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(ev.id)}
                      onChange={() => handleToggle(ev.id)}
                      disabled={!hasPhone || sending}
                    />
                    <span className={styles.recipientName}>{ev.name}</span>
                    <span className={styles.recipientPhone}>
                      {hasPhone ? formatPhone(ev.phone_number) : '(번호 없음)'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 메시지 입력 */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>메시지</label>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
              rows={5}
              disabled={sending}
            />
            <div className={styles.byteCounter}>
              <span>
                {byteInfo.bytes}/{byteInfo.max} bytes
              </span>
              <span
                className={`${styles.typeBadge} ${
                  byteInfo.type === 'SMS'
                    ? styles.badgeSms
                    : byteInfo.type === 'LMS'
                      ? styles.badgeLms
                      : styles.badgeOver
                }`}
              >
                {byteInfo.type}
              </span>
            </div>
          </div>

          {/* 발송 */}
          <div className={styles.actions}>
            {sending && (
              <span className={styles.progressText}>
                발송 중... {progress.current}/{progress.total}
              </span>
            )}
            <Button
              onClick={handleSend}
              loading={sending}
              disabled={
                selectedCount === 0 ||
                !message.trim() ||
                byteInfo.type === 'OVER'
              }
            >
              {sending
                ? '발송 중...'
                : `발송 (${selectedCount}명에게)`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
