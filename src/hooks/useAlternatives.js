import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAlternatives(projectId) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const maxOrder = alternatives.reduce((max, a) => Math.max(max, a.sort_order || 0), 0);
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
  }, [projectId, alternatives]);

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
    // Delete children
    const children = alternatives.filter(a => a.parent_id === id);
    for (const child of children) {
      await deleteAlternative(child.id);
    }
    const { error } = await supabase.from('alternatives').delete().eq('id', id);
    if (error) throw error;
    setAlternatives(prev => prev.filter(a => a.id !== id));
  }, [alternatives]);

  return {
    alternatives,
    loading,
    fetchAlternatives,
    addAlternative,
    updateAlternative,
    deleteAlternative,
  };
}
