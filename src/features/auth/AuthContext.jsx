import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { getMe, signIn, signUp, signOut, getToken } from '../../lib/authClient.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'guest' | 'error'
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'authenticated', user: action.payload, error: null };
    case 'LOAD_GUEST':
      return { ...state, status: 'guest', user: null, error: null };
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SIGN_OUT':
      return { ...state, status: 'guest', user: null, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalState, setModalState] = useState({ open: false, mode: 'sign-in' });

  const openAuthModal = useCallback((mode = 'sign-in') => {
    dispatch({ type: 'CLEAR_ERROR' });
    setModalState({ open: true, mode });
  }, []);
  const closeAuthModal = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
    setModalState(s => ({ ...s, open: false, info: undefined }));
  }, []);

  const loadUser = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const token = getToken();
      console.log('loadUser - token:', token ? 'exists' : 'missing');
      
      if (!token) {
        console.log('loadUser - no token, setting guest mode');
        dispatch({ type: 'LOAD_GUEST' });
        return;
      }
      
      const me = await getMe();
      console.log('loadUser - profile response:', me);
      
      if (me && me.id) {
        console.log('loadUser - dispatching LOAD_SUCCESS with user:', me);
        dispatch({ type: 'LOAD_SUCCESS', payload: me });
      } else {
        console.log('loadUser - invalid profile response, setting guest mode');
        dispatch({ type: 'LOAD_GUEST' });
      }
    } catch (err) {
      console.error('loadUser - error:', err);
      dispatch({ type: 'ERROR', payload: err?.message || 'Failed to load user' });
      dispatch({ type: 'LOAD_GUEST' });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const performSignIn = useCallback(async (form) => {
    dispatch({ type: 'LOAD_START' });
    try {
      const signInResponse = await signIn(form);
      console.log('Sign-in response:', signInResponse);
      
      // Extract user from sign-in response
      const userData = signInResponse?.data?.user || signInResponse?.data || signInResponse?.user;
      console.log('User data from sign-in:', userData);
      
      if (userData && userData.id) {
        // Dispatch success with user data from sign-in response
        console.log('Dispatching LOAD_SUCCESS with user:', userData);
        dispatch({ type: 'LOAD_SUCCESS', payload: userData });
      } else {
        // Fallback: try to load user profile if not included in sign-in response
        console.log('User not in sign-in response, calling loadUser()');
        await loadUser();
      }
      
      // Close modal after user is loaded
      closeAuthModal();
      return { ok: true };
    } catch (err) {
      console.error('Sign-in error:', err);
      dispatch({ type: 'ERROR', payload: err?.message || 'Sign-in failed' });
      return { ok: false, error: err?.message, validationErrors: err?.validationErrors };
    }
  }, [loadUser, closeAuthModal]);

  const performSignUp = useCallback(async (form) => {
    dispatch({ type: 'LOAD_START' });
    try {
      const res = await signUp(form);
      // After sign-up, show confirmation info and switch modal to sign-in
      setModalState({ open: true, mode: 'sign-in', info: 'Confirmation email sent. Please sign in after verification.' });
      dispatch({ type: 'LOAD_GUEST' });
      return { ok: true, data: res };
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err?.message || 'Sign-up failed' });
      return { ok: false, error: err?.message, validationErrors: err?.validationErrors };
    }
  }, []);

  const performSignOut = useCallback(async () => {
    await signOut();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const value = useMemo(() => ({
    user: state.user,
    status: state.status,
    error: state.error,
    openAuthModal,
    closeAuthModal,
    performSignIn,
    performSignUp,
    performSignOut,
    modalState,
    setModalState,
  }), [state.user, state.status, state.error, openAuthModal, closeAuthModal, performSignIn, performSignUp, performSignOut, modalState]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


