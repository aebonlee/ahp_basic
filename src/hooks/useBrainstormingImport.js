import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useBrainstormingImport(projectId) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchBrainstormingItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('brainstorming_items')
      .select('*')
      .eq('project_id', projectId)
      .in('zone', ['criterion', 'alternative'])
      .order('sort_order');
    if (error) throw error;
    return data || [];
  }, [projectId]);

  const importToModel = useCallback(async (criteria, alternatives, addCriterion, addAlternative) => {
    setImporting(true);
    setResult(null);
    try {
      const bsItems = await fetchBrainstormingItems();

      const existingCriteriaNames = new Set(
        criteria.map(c => c.name.trim().toLowerCase())
      );
      const existingAltNames = new Set(
        alternatives.map(a => a.name.trim().toLowerCase())
      );

      let importedCriteria = 0;
      let importedAlternatives = 0;
      let skipped = 0;

      for (const item of bsItems) {
        const normalizedText = item.text.trim().toLowerCase();

        if (item.zone === 'criterion') {
          if (existingCriteriaNames.has(normalizedText)) {
            skipped++;
          } else {
            await addCriterion({ name: item.text.trim(), parent_id: null });
            existingCriteriaNames.add(normalizedText);
            importedCriteria++;
          }
        } else if (item.zone === 'alternative') {
          if (existingAltNames.has(normalizedText)) {
            skipped++;
          } else {
            await addAlternative({ name: item.text.trim(), parent_id: null });
            existingAltNames.add(normalizedText);
            importedAlternatives++;
          }
        }
      }

      const res = { importedCriteria, importedAlternatives, skipped };
      setResult(res);
      return res;
    } catch (err) {
      setResult({ error: err.message });
      throw err;
    } finally {
      setImporting(false);
    }
  }, [fetchBrainstormingItems]);

  const clearResult = useCallback(() => setResult(null), []);

  return { importing, result, importToModel, fetchBrainstormingItems, clearResult };
}
