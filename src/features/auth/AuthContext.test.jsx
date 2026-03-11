vi.unmock('./AuthContext.jsx');

import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import {
  clearToken,
  getMe,
  getToken,
  keepAlive,
  signIn,
  signOut,
  signUp,
} from '../../lib/authClient.js';

vi.mock('../../lib/authClient.js', () => ({
  clearToken: vi.fn(),
  getMe: vi.fn(),
  getToken: vi.fn(),
  keepAlive: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock('../../lib/cookies.js', () => ({
  getCookie: vi.fn(() => null),
  setCookie: vi.fn(),
}));

function AuthStateProbe() {
  const { modalState, status } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{status}</div>
      <div data-testid="auth-modal-state">{modalState.open ? modalState.mode : 'closed'}</div>
    </div>
  );
}

describe('AuthContext keep-alive validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getToken.mockReturnValue('valid-token');
    getMe.mockResolvedValue({ id: 'user-1', fullName: 'Test User' });
    keepAlive.mockResolvedValue({ ok: true });
    signIn.mockResolvedValue({ ok: true });
    signOut.mockResolvedValue(undefined);
    signUp.mockResolvedValue({ ok: true });
  });

  it('checks keep-alive again when the app regains focus', async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(keepAlive).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(keepAlive).toHaveBeenCalledTimes(2);
    });
  });

  it('opens the sign-in modal when keep-alive returns an auth error', async () => {
    keepAlive.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(clearToken).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByTestId('auth-modal-state')).toHaveTextContent('sign-in');
    });
  });
});