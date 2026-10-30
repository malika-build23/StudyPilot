import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('studypilot_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('studypilot_token');
    localStorage.removeItem('studypilot_user');
  };

  // Validate session on app initialization
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('studypilot_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('studypilot_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('studypilot_token', receivedToken);
      localStorage.setItem('studypilot_user', JSON.stringify(receivedUser));

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setAuthError(null);
    try {
      const res = await authAPI.register({
        name,
        email,
        password,
        confirmPassword,
      });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('studypilot_token', receivedToken);
      localStorage.setItem('studypilot_user', JSON.stringify(receivedUser));

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please check your details.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const updateProfileName = async (newName) => {
    try {
      const res = await userAPI.updateProfile({ name: newName });
      if (res.data?.success && res.data?.data) {
        const updated = { ...user, name: res.data.data.name };
        setUser(updated);
        localStorage.setItem('studypilot_user', JSON.stringify(updated));
        return { success: true, data: res.data.data };
      }
      return { success: false, error: 'Failed to update name.' };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update profile name.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateProfileName,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
