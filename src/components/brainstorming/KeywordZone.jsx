import { useState } from 'react';
import KeywordItem from './KeywordItem';
import styles from './KeywordZone.module.css';

export default function KeywordZone({ zone, items, onAdd, onUpdate, onDelete, onDragStart, onDrop, isDragging }) {
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
    setShowInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setShowInput(false); setInput(''); }
  };

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dropTarget : ''}`}
      style={{ borderTopColor: zone.color }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(null); }}
    >
      <div className={styles.header} style={{ color: zone.color }}>
        <span>{zone.label}</span>
        <span className={styles.count}>{items.length}</span>
      </div>

      <div className={styles.items}>
        {items.map(item => (
          <KeywordItem
            key={item.id}
            item={item}
            color={zone.color}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDragStart={() => onDragStart(item)}
            onDrop={(parentId) => onDrop(parentId)}
          />
        ))}
      </div>

      {showInput ? (
        <div className={styles.inputArea}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="키워드 입력 후 Enter"
            autoFocus
          />
        </div>
      ) : (
        <button
          className={styles.addBtn}
          onClick={() => setShowInput(true)}
        >
          + 입력
        </button>
      )}
    </div>
  );
}
