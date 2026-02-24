import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import KeywordZone from './KeywordZone';
import styles from './BrainstormingBoard.module.css';

const ZONES = [
  { key: 'alternative',    label: '대안',      color: '#4a9eff' },
  { key: 'advantage',      label: '장점',      color: '#4caf50' },
  { key: 'disadvantage',   label: '단점',      color: '#f44336' },
  { key: 'criterion',      label: '판단 기준', color: '#ff9800' },
];

const ZONE_KEYS = ZONES.map(z => z.key);

export default function BrainstormingBoard({ projectId }) {
  const [items, setItems] = useState({ alternative: [], advantage: [], disadvantage: [], criterion: [] });
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, [projectId]);

  const loadItems = async () => {
    const { data } = await supabase
      .from('brainstorming_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    if (data) {
      const grouped = { alternative: [], advantage: [], disadvantage: [], criterion: [] };
      for (const item of data) {
        if (grouped[item.zone]) grouped[item.zone].push(item);
      }
      setItems(grouped);
    }
  };

  const addItem = async (zone, text) => {
    if (!text.trim()) return;
    const maxOrder = items[zone].reduce((max, i) => Math.max(max, i.sort_order || 0), 0);
    const { data } = await supabase
      .from('brainstorming_items')
      .insert({
        project_id: projectId,
        zone,
        text: text.trim(),
        sort_order: maxOrder + 1,
        parent_id: null,
      })
      .select()
      .single();
    if (data) {
      setItems(prev => ({ ...prev, [zone]: [...prev[zone], data] }));
    }
  };

  const updateItem = async (id, text) => {
    await supabase.from('brainstorming_items').update({ text }).eq('id', id);
    setItems(prev => {
      const next = { ...prev };
      for (const zone of ZONE_KEYS) {
        next[zone] = next[zone].map(i => i.id === id ? { ...i, text } : i);
      }
      return next;
    });
  };

  const deleteItem = async (id) => {
    await supabase.from('brainstorming_items').delete().eq('id', id);
    setItems(prev => {
      const next = { ...prev };
      for (const zone of ZONE_KEYS) {
        next[zone] = next[zone].filter(i => i.id !== id);
      }
      return next;
    });
  };

  const handleDragStart = (item, sourceZone) => {
    setDragItem({ ...item, sourceZone });
  };

  const handleDrop = async (targetZone, targetParentId) => {
    if (!dragItem) return;
    const { sourceZone, id } = dragItem;

    if (sourceZone === targetZone && !targetParentId) {
      setDragItem(null);
      return;
    }

    await supabase.from('brainstorming_items')
      .update({ zone: targetZone, parent_id: targetParentId || null })
      .eq('id', id);

    setItems(prev => {
      const next = { ...prev };
      next[sourceZone] = next[sourceZone].filter(i => i.id !== id);
      const movedItem = { ...dragItem, zone: targetZone, parent_id: targetParentId || null };
      next[targetZone] = [...next[targetZone], movedItem];
      return next;
    });

    setDragItem(null);
  };

  const handleTrashDrop = async () => {
    if (!dragItem) return;
    await deleteItem(dragItem.id);
    setDragItem(null);
  };

  return (
    <div className={styles.board}>
      <div className={styles.zones}>
        {ZONES.map(zone => (
          <KeywordZone
            key={zone.key}
            zone={zone}
            items={items[zone.key]}
            onAdd={(text) => addItem(zone.key, text)}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onDragStart={(item) => handleDragStart(item, zone.key)}
            onDrop={(parentId) => handleDrop(zone.key, parentId)}
            isDragging={!!dragItem}
          />
        ))}
      </div>

      <div
        className={`${styles.trash} ${dragItem ? styles.trashActive : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleTrashDrop}
      >
        삭제 (여기에 놓기)
      </div>
    </div>
  );
}
