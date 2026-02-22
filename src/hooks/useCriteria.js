import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useCriteria(projectId) {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCriteria = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('criteria')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    if (!error) setCriteria(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchCriteria(); }, [fetchCriteria]);

  const addCriterion = useCallback(async (criterion) => {
    const maxOrder = criteria.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
    const { data, error } = await supabase
      .from('criteria')
      .insert({
        ...criterion,
        project_id: projectId,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();
    if (error) throw error;
    setCriteria(prev => [...prev, data]);
    return data;
  }, [projectId, criteria]);

  const updateCriterion = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('criteria')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setCriteria(prev => prev.map(c => c.id === id ? data : c));
    return data;
  }, []);

  const deleteCriterion = useCallback(async (id) => {
    // Delete children recursively
    const children = criteria.filter(c => c.parent_id === id);
    for (const child of children) {
      await deleteCriterion(child.id);
    }
    const { error } = await supabase.from('criteria').delete().eq('id', id);
    if (error) throw error;
    setCriteria(prev => prev.filter(c => c.id !== id));
  }, [criteria]);

  // Build tree structure
  const getTree = useCallback(() => {
    const map = {};
    const roots = [];
    for (const c of criteria) {
      map[c.id] = { ...c, children: [] };
    }
    for (const c of criteria) {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    }
    return roots;
  }, [criteria]);

  const getLevel = useCallback((id) => {
    let level = 0;
    let current = criteria.find(c => c.id === id);
    while (current?.parent_id) {
      level++;
      current = criteria.find(c => c.id === current.parent_id);
    }
    return level;
  }, [criteria]);

  return {
    criteria,
    loading,
    fetchCriteria,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    getTree,
    getLevel,
  };
}
