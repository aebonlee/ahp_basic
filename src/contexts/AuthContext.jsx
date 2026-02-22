import { createContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { USER_MODE } from '../lib/constants';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  session: null,
  mode: USER_MODE.ADMIN,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload?.user || null,
        session: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SIGN_OUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_SESSION', payload: session });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch({ type: 'SET_SESSION', payload: session });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Restore saved mode
  useEffect(() => {
    const savedMode = localStorage.getItem('ahp_mode');
    if (savedMode && Object.values(USER_MODE).includes(savedMode)) {
      dispatch({ type: 'SET_MODE', payload: savedMode });
    }
  }, []);

  const setMode = useCallback((mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    localStorage.setItem('ahp_mode', mode);
  }, []);

  const signIn = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const value = {
    ...state,
    setMode,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
