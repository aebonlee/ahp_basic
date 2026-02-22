import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useEvaluators(projectId) {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvaluators = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('evaluators')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    if (!error) setEvaluators(data || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchEvaluators();
  }, [fetchEvaluators]);

  const addEvaluator = useCallback(async (evaluator) => {
    const { data, error } = await supabase
      .from('evaluators')
      .insert({ ...evaluator, project_id: projectId })
      .select()
      .single();
    if (error) throw error;
    setEvaluators(prev => [...prev, data]);
    return data;
  }, [projectId]);

  const updateEvaluator = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('evaluators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setEvaluators(prev => prev.map(e => e.id === id ? data : e));
    return data;
  }, []);

  const deleteEvaluator = useCallback(async (id) => {
    const { error } = await supabase.from('evaluators').delete().eq('id', id);
    if (error) throw error;
    setEvaluators(prev => prev.filter(e => e.id !== id));
  }, []);

  return { evaluators, loading, fetchEvaluators, addEvaluator, updateEvaluator, deleteEvaluator };
}
