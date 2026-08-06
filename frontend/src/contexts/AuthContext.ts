import { createContext } from 'react';
import type { SessionState } from '../types/user.types';

export interface AuthContextValue extends SessionState {
  initialized: boolean;
  refreshSession: (force?: boolean) => Promise<SessionState>;
  login: (credentials: Record<string, unknown>) => Promise<SessionState>;
  logout: () => Promise<void>;
  expireSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
