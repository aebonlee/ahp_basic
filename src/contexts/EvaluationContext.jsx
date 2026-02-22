import { createContext, useReducer, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const EvaluationContext = createContext(null);

const initialState = {
  criteria: [],
  alternatives: [],
  comparisons: {},
  priorities: {},
  crValues: {},
  currentPage: 0,
  totalPages: 0,
  pageSequence: [],
  loading: false,
  error: null,
};

function evalReducer(state, action) {
  switch (action.type) {
    case 'SET_CRITERIA':
      return { ...state, criteria: action.payload };
    case 'SET_ALTERNATIVES':
      return { ...state, alternatives: action.payload };
    case 'SET_COMPARISONS':
      return { ...state, comparisons: action.payload };
    case 'UPDATE_COMPARISON': {
      const key = action.payload.key;
      return {
        ...state,
        comparisons: { ...state.comparisons, [key]: action.payload.value },
      };
    }
    case 'SET_PRIORITIES':
      return { ...state, priorities: { ...state.priorities, ...action.payload } };
    case 'SET_CR_VALUES':
      return { ...state, crValues: { ...state.crValues, ...action.payload } };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_PAGE_SEQUENCE':
      return {
        ...state,
        pageSequence: action.payload,
        totalPages: action.payload.length,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function EvaluationProvider({ children }) {
  const [state, dispatch] = useReducer(evalReducer, initialState);

  const loadProjectData = useCallback(async (projectId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [criteriaRes, altRes, compRes] = await Promise.all([
        supabase.from('criteria').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('alternatives').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('pairwise_comparisons').select('*').eq('project_id', projectId),
      ]);

      if (criteriaRes.error) throw criteriaRes.error;
      if (altRes.error) throw altRes.error;
      if (compRes.error) throw compRes.error;

      dispatch({ type: 'SET_CRITERIA', payload: criteriaRes.data });
      dispatch({ type: 'SET_ALTERNATIVES', payload: altRes.data });

      // Build comparisons map
      const compMap = {};
      for (const c of compRes.data) {
        compMap[`${c.criterion_id}:${c.row_id}:${c.col_id}`] = c.value;
      }
      dispatch({ type: 'SET_COMPARISONS', payload: compMap });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const saveComparison = useCallback(async (projectId, evaluatorId, criterionId, rowId, colId, value) => {
    const key = `${criterionId}:${rowId}:${colId}`;
    dispatch({ type: 'UPDATE_COMPARISON', payload: { key, value } });

    const { error } = await supabase
      .from('pairwise_comparisons')
      .upsert({
        project_id: projectId,
        evaluator_id: evaluatorId,
        criterion_id: criterionId,
        row_id: rowId,
        col_id: colId,
        value,
      }, { onConflict: 'project_id,evaluator_id,criterion_id,row_id,col_id' });

    if (error) throw error;
  }, []);

  return (
    <EvaluationContext.Provider value={{ ...state, dispatch, loadProjectData, saveComparison }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) throw new Error('useEvaluation must be used within EvaluationProvider');
  return context;
}
