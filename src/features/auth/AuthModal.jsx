import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';

export default function AuthModal({ open, mode, info, onClose }) {
  const firstFieldRef = useRef(null);
  const { performSignIn, performSignUp, status, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', passwordConfirm: '' });
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState(null);

  useEffect(() => {
    if (open && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
    // Clear local error and validation errors when opening or switching modes
    if (open) {
      setLocalError('');
      setValidationErrors(null);
    }
  }, [open, mode]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setValidationErrors(null);
    
    // Validate passwords match for sign-up
    if (mode === 'sign-up' && form.password !== form.passwordConfirm) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      if (mode === 'sign-in') {
        const res = await performSignIn({ email: form.email, password: form.password });
        if (!res.ok) {
          // Display validation errors if available, otherwise show general error
          if (res.validationErrors && res.validationErrors.length > 0) {
            setValidationErrors(res.validationErrors);
          } else {
            setLocalError(res.error || 'Failed to sign in');
          }
        }
      } else {
        const res = await performSignUp({ email: form.email, password: form.password, fullName: form.fullName });
        if (!res.ok) {
          // Display validation errors if available, otherwise show general error
          if (res.validationErrors && res.validationErrors.length > 0) {
            setValidationErrors(res.validationErrors);
          } else {
            setLocalError(res.error || 'Failed to sign up');
          }
        }
      }
    } catch (err) {
      setLocalError(err?.message || 'Something went wrong');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => { setLocalError(''); setValidationErrors(null); onClose?.(); }} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </h2>
        {info ? <p className="text-xs text-gray-600 mb-3">{info}</p> : null}
        {(localError || error || validationErrors) ? (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {validationErrors && validationErrors.length > 0 ? (
              validationErrors.length === 1 ? (
                validationErrors[0]
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((errorMsg, index) => (
                    <li key={index}>{errorMsg}</li>
                  ))}
                </ul>
              )
            ) : (
              localError || error
            )}
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'sign-up' && (
            <div>
              <label className="block text-xs text-gray-700 mb-1" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={onChange}
                ref={firstFieldRef}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              ref={mode === 'sign-in' ? firstFieldRef : undefined}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            />
          </div>
          {mode === 'sign-up' && (
            <div>
              <label className="block text-xs text-gray-700 mb-1" htmlFor="passwordConfirm">Confirm Password</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                value={form.passwordConfirm}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setLocalError(''); setValidationErrors(null); onClose?.(); }}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {status === 'loading' ? 'Please wait…' : (mode === 'sign-in' ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['sign-in', 'sign-up']).isRequired,
  info: PropTypes.string,
  onClose: PropTypes.func,
};


