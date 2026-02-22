import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAlternatives(projectId) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ref to avoid stale closures in callbacks
  const alternativesRef = useRef(alternatives);
  useEffect(() => { alternativesRef.current = alternatives; }, [alternatives]);

  const fetchAlternatives = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('alternatives')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    if (!error) setAlternatives(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchAlternatives(); }, [fetchAlternatives]);

  const addAlternative = useCallback(async (alt) => {
    const maxOrder = alternativesRef.current.reduce((max, a) => Math.max(max, a.sort_order || 0), 0);
    const { data, error } = await supabase
      .from('alternatives')
      .insert({
        ...alt,
        project_id: projectId,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (error) throw error;
    setAlternatives(prev => [...prev, data]);
    return data;
  }, [projectId]);

  const updateAlternative = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('alternatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setAlternatives(prev => prev.map(a => a.id === id ? data : a));
    return data;
  }, []);

  const deleteAlternative = useCallback(async (id) => {
    // DB has ON DELETE CASCADE on parent_id, so only delete the root node
    const { error } = await supabase.from('alternatives').delete().eq('id', id);
    if (error) throw error;
    // Remove the alternative and all descendants from local state
    setAlternatives(prev => {
      const toRemove = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const a of prev) {
          if (!toRemove.has(a.id) && toRemove.has(a.parent_id)) {
            toRemove.add(a.id);
            changed = true;
          }
        }
      }
      return prev.filter(a => !toRemove.has(a.id));
    });
  }, []);

  return {
    alternatives,
    loading,
    fetchAlternatives,
    addAlternative,
    updateAlternative,
    deleteAlternative,
  };
}
