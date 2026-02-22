import { createContext, useReducer, useCallback, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const ProjectContext = createContext(null);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
        currentProject: state.currentProject?.id === action.payload.id
          ? { ...state.currentProject, ...action.payload }
          : state.currentProject,
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchProjects = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else {
      dispatch({ type: 'SET_PROJECTS', payload: data });
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: data });
    }
    return data;
  }, []);

  const createProject = useCallback(async (project) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('로그인 세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.');
    }
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, owner_id: user.id, status: 2 })
      .select()
      .single();
    if (error) throw new Error('프로젝트 저장 실패: ' + error.message);
    dispatch({ type: 'ADD_PROJECT', payload: data });
    return data;
  }, []);

  const updateProject = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('프로젝트 수정 실패: ' + error.message);
    dispatch({ type: 'UPDATE_PROJECT', payload: data });
    return data;
  }, []);

  const deleteProject = useCallback(async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        dispatch,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
}
