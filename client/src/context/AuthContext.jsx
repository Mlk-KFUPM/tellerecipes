import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as authApi from '../api/auth.js';
import { fetchProfile } from '../api/user.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [status, setStatus] = useState('idle'); // idle | loading | authenticated | error
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setStatus('idle');
        return;
      }
      try {
        setStatus('loading');
        const profile = await fetchProfile(token);
        setUser(profile.user);
        setStatus('authenticated');
      } catch (err) {
        console.error('Auth bootstrap failed', err);
        setToken('');
        localStorage.removeItem('accessToken');
        setUser(null);
        setStatus('idle');
      }
    };
    bootstrap();
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const profile = await fetchProfile(token);
    setUser(profile.user);
    return profile.user;
  }, [token]);

  const login = useCallback(async (credentials) => {
    setError(null);
    setStatus('loading');
    const res = await authApi.login(credentials);
    setToken(res.accessToken);
    localStorage.setItem('accessToken', res.accessToken);
    setUser(res.user);
    setStatus('authenticated');
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    setStatus('loading');
    const res = await authApi.register(data);
    setToken(res.accessToken);
    localStorage.setItem('accessToken', res.accessToken);
    setUser(res.user);
    setStatus('authenticated');
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem('accessToken');
      setStatus('idle');
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      login,
      register,
      logout,
      setUser,
      refreshProfile,
      isAuthenticated: status === 'authenticated',
      role: user?.role || null,
    }),
    [user, token, status, error, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
