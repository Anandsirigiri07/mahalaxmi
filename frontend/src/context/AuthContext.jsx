import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  supabase,
  isSupabaseConfigured,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignInWithGoogle,
  supabaseSignOut,
  supabaseGetSession,
  supabaseOnAuthStateChange
} from '../services/supabase';

const AuthContext = createContext();

function readStoredUser() {
  try {
    const saved = localStorage.getItem('mn_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    localStorage.removeItem('mn_user');
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSupabase = () => {};

    const checkAuth = async () => {
      // 1. Check Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const session = await supabaseGetSession();
          if (session?.user) {
            const sbUser = session.user;
            const mappedUser = {
              id: sbUser.id,
              email: sbUser.email,
              full_name: sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
              phone: sbUser.user_metadata?.phone || '',
              role: sbUser.user_metadata?.role || 'customer',
              account_type: sbUser.user_metadata?.account_type || (sbUser.user_metadata?.business_name ? 'wholesale' : 'retail'),
              verification_status: sbUser.user_metadata?.is_verified_wholesale ? 'approved' : 'pending',
              shop_name: sbUser.user_metadata?.business_name || '',
              gst_number: sbUser.user_metadata?.gstin || ''
            };
            setUser(mappedUser);
            localStorage.setItem('mn_user', JSON.stringify(mappedUser));
          }

          unsubscribeSupabase = supabaseOnAuthStateChange((event, session) => {
            if (session?.user) {
              const sbUser = session.user;
              const mapped = {
                id: sbUser.id,
                email: sbUser.email,
                full_name: sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
                phone: sbUser.user_metadata?.phone || '',
                role: sbUser.user_metadata?.role || 'customer',
                account_type: sbUser.user_metadata?.account_type || (sbUser.user_metadata?.business_name ? 'wholesale' : 'retail'),
                verification_status: sbUser.user_metadata?.is_verified_wholesale ? 'approved' : 'pending',
                shop_name: sbUser.user_metadata?.business_name || '',
                gst_number: sbUser.user_metadata?.gstin || ''
              };
              setUser(mapped);
              localStorage.setItem('mn_user', JSON.stringify(mapped));
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem('mn_user');
            }
          });
        } catch (sbErr) {
          console.warn('Supabase session check notice:', sbErr);
        }
      }

      // 2. Always verify local JWT session against backend so role/approval changes sync live
      const token = localStorage.getItem('mn_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('mn_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem('mn_token');
            localStorage.removeItem('mn_user');
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    checkAuth();

    return () => {
      unsubscribeSupabase();
    };
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const data = await supabaseSignIn({ email, password });
        if (data?.user) {
          const mapped = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
            role: data.user.user_metadata?.role || 'customer',
            account_type: data.user.user_metadata?.business_name ? 'wholesale' : 'retail',
            verification_status: data.user.user_metadata?.is_verified_wholesale ? 'approved' : 'pending'
          };
          setUser(mapped);
          localStorage.setItem('mn_user', JSON.stringify(mapped));
          return { success: true, user: mapped };
        }
      } catch (err) {
        console.warn('Supabase sign-in fallback to backend API:', err.message);
      }
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data;
        localStorage.setItem('mn_token', token);
        localStorage.setItem('mn_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return res.data;
      }
      throw new Error(res.data.message || 'Login failed.');
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.message || apiErr.message || 'Authentication failed. Please check your credentials.';
      throw new Error(errMsg);
    }
  };

  const getOwnerStatus = useCallback(async () => {
    try {
      const res = await api.get('/auth/owner-status');
      return res.data;
    } catch (err) {
      return {
        success: true,
        isRegistered: true,
        registrationClosed: true,
        owner: {
          name: 'Manoharsingh P. Rathore (Proprietor)',
          phone: '******2188',
          title: 'Store Proprietor'
        },
        message: 'Store Owner account is registered. Registration is permanently closed.'
      };
    }
  }, []);

  const ownerRegister = async (data) => {
    try {
      const res = await api.post('/auth/owner-register', data);
      if (res.data.success) {
        const { token, user: loggedUser } = res.data;
        localStorage.setItem('mn_token', token);
        localStorage.setItem('mn_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return res.data;
      }
      throw new Error(res.data.message || 'Owner registration failed.');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Owner registration is permanently closed.';
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabaseSignInWithGoogle();
      return { success: true };
    }
    throw new Error('Google Sign-In requires Supabase OAuth configuration. Please sign in or register using your email and password.');
  };

  const ownerLogin = async (credentials) => {
    const payload = typeof credentials === 'object' && credentials !== null ? credentials : { identifier: '', pin: '' };
    const cleanId = String(payload.identifier || '').trim();
    const cleanPin = String(payload.pin || payload.password || '').trim();

    if (!cleanId || !cleanPin) {
      throw new Error('Please enter both your registered Owner Email/Phone and password.');
    }

    try {
      const res = await api.post('/auth/owner-login', { identifier: cleanId, pin: cleanPin });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data;
        localStorage.setItem('mn_token', token);
        localStorage.setItem('mn_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return res.data;
      }
      throw new Error(res.data.message || 'Owner authentication failed.');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Owner authentication failed.';
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const data = await supabaseSignUp({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          phone: userData.phone,
          role: 'customer',
          business_name: userData.shop_name || userData.business_name || '',
          gstin: userData.gst_number || userData.gstin || ''
        });
        if (data?.user) {
          const isW = userData.account_type === 'wholesale';
          const mapped = {
            id: data.user.id,
            email: userData.email,
            full_name: userData.full_name,
            phone: userData.phone,
            role: 'customer',
            account_type: isW ? 'wholesale' : 'retail',
            verification_status: isW ? 'pending' : null,
            shop_name: userData.shop_name || userData.business_name || '',
            gst_number: userData.gst_number || userData.gstin || ''
          };
          setUser(mapped);
          localStorage.setItem('mn_user', JSON.stringify(mapped));
          return { success: true, user: mapped };
        }
      } catch (err) {
        console.warn('Supabase sign-up error, trying local backend:', err.message);
      }
    }

    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token, user: newUser } = res.data;
        localStorage.setItem('mn_token', token);
        localStorage.setItem('mn_user', JSON.stringify(newUser));
        setUser(newUser);
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed.');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabaseSignOut();
      } catch (e) {}
    }
    try {
      await api.post('/auth/logout');
    } catch (e) {}

    localStorage.removeItem('mn_token');
    localStorage.removeItem('mn_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('mn_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    }
  };

  const isAdmin = Boolean(user && user.role === 'admin');
  const isWholesale = Boolean(user && user.account_type === 'wholesale');
  const isWholesaleApproved = Boolean(isWholesale && user.verification_status === 'approved');
  const isWholesalePending = Boolean(isWholesale && user.verification_status === 'pending');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      ownerLogin,
      getOwnerStatus,
      ownerRegister,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin,
      isWholesale,
      isWholesaleApproved,
      isWholesalePending,
      isSupabaseActive: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
