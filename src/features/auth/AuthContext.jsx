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
      if (!getToken()) {
        dispatch({ type: 'LOAD_GUEST' });
        return;
      }
      const me = await getMe();
      if (me && me.id) dispatch({ type: 'LOAD_SUCCESS', payload: me });
      else dispatch({ type: 'LOAD_GUEST' });
    } catch (err) {
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
      await signIn(form);
      await loadUser();
      closeAuthModal();
      return { ok: true };
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err?.message || 'Sign-in failed' });
      return { ok: false, error: err?.message };
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
      return { ok: false, error: err?.message };
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


