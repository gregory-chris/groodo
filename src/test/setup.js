import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

const createMockClient = () => ({
  type: 'local',
  getState: vi.fn().mockResolvedValue({ tasks: [], currentWeek: null }),
  setState: vi.fn().mockResolvedValue(undefined),
  getTasks: vi.fn().mockResolvedValue([]),
  clear: vi.fn().mockResolvedValue(undefined),
  syncTasks: vi.fn().mockResolvedValue({ tasks: [] })
});

const mockUseTaskStorageContext = vi.fn(() => ({
  client: createMockClient(),
  localClient: createMockClient(),
  remoteClient: null,
  mode: 'local',
  version: 0,
  syncState: { status: 'idle', error: null, timestamp: null }
}));

const mockUseAuth = vi.fn(() => ({
  user: null,
  status: 'guest',
  error: null,
  isAuthenticated: false,
  openAuthModal: vi.fn(),
  closeAuthModal: vi.fn(),
  performSignIn: vi.fn().mockResolvedValue({ ok: true }),
  performSignUp: vi.fn().mockResolvedValue({ ok: true }),
  performSignOut: vi.fn().mockResolvedValue(undefined),
  modalState: { open: false, mode: 'sign-in' },
  setModalState: vi.fn()
}));

vi.mock('../services/storage/TaskStorageContext.jsx', () => ({
  TaskStorageProvider: ({ children }) => children,
  useTaskStorageContext: () => mockUseTaskStorageContext()
}));

vi.mock('../features/auth/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockUseAuth()
}));

beforeEach(() => {
  mockUseTaskStorageContext.mockClear();
  mockUseAuth.mockClear();
});
