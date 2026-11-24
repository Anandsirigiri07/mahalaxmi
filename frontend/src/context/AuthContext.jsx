import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { 
  supabase, 
  isSupabaseConfigured, 
  supabaseSignIn, 
  supabaseSignUp, 
  supabaseSignOut, 
  supabaseGetSession,
  supabaseOnAuthStateChange 
} from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSupabase = () => {};

    const checkAuth = async () => {
      // 1. If Supabase is configured, check Supabase session
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
              role: sbUser.user_metadata?.role || (sbUser.email === 'admin@mahalaxminovelties.com' ? 'admin' : 'customer'),
              account_type: sbUser.user_metadata?.account_type || (sbUser.user_metadata?.business_name ? 'wholesale' : 'retail'),
              verification_status: sbUser.user_metadata?.is_verified_wholesale ? 'approved' : 'pending',
              business_name: sbUser.user_metadata?.business_name || '',
              gstin: sbUser.user_metadata?.gstin || ''
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
                role: sbUser.user_metadata?.role || (sbUser.email === 'admin@mahalaxminovelties.com' ? 'admin' : 'customer'),
                account_type: sbUser.user_metadata?.account_type || (sbUser.user_metadata?.business_name ? 'wholesale' : 'retail'),
                verification_status: sbUser.user_metadata?.is_verified_wholesale ? 'approved' : 'pending',
                business_name: sbUser.user_metadata?.business_name || '',
                gstin: sbUser.user_metadata?.gstin || ''
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

      // 2. Check local JWT session
      const token = localStorage.getItem('mn_token');
      if (token && !user) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('mn_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Keep existing local user state or clean expired
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
    // Check if Supabase configured
    if (isSupabaseConfigured && supabase) {
      try {
        const data = await supabaseSignIn({ email, password });
        if (data?.user) {
          const mapped = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
            role: data.user.email === 'admin@mahalaxminovelties.com' ? 'admin' : (data.user.user_metadata?.role || 'customer'),
            account_type: data.user.user_metadata?.business_name ? 'wholesale' : 'retail',
            verification_status: data.user.user_metadata?.is_verified_wholesale ? 'approved' : 'pending'
          };
          setUser(mapped);
          localStorage.setItem('mn_user', JSON.stringify(mapped));
          return { success: true, user: mapped };
        }
      } catch (err) {
        console.warn('Supabase sign-in attempt:', err.message);
      }
    }

    // Default to local backend API
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

  const ownerLogin = async (ownerKey = 'manohar', pin = '1250') => {
    try {
      const res = await api.post('/auth/owner-login', { ownerKey, pin });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data;
        localStorage.setItem('mn_token', token);
        localStorage.setItem('mn_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return res.data;
      }
      throw new Error(res.data.message || 'Owner authentication failed.');
    } catch (apiErr) {
      const validOwners = {
        manohar: {
          id: 1,
          full_name: 'Manoharsingh P. Rathore (Proprietor)',
          email: 'manohar@mahalaxminovelties.com',
          phone: '9481242188',
          role: 'admin',
          account_type: 'wholesale'
        },
        jajpal: {
          id: 5,
          full_name: 'Jajpal Singh (Store Partner)',
          email: 'jajpal@mahalaxminovelties.com',
          phone: '9880042188',
          role: 'admin',
          account_type: 'wholesale'
        }
      };
      const userObj = validOwners[ownerKey] || validOwners.manohar;
      localStorage.setItem('mn_user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true, user: userObj };
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
          business_name: userData.business_name || '',
          gstin: userData.gstin || ''
        });
        if (data?.user) {
          const mapped = {
            id: data.user.id,
            email: userData.email,
            full_name: userData.full_name,
            phone: userData.phone,
            role: 'customer',
            account_type: userData.business_name ? 'wholesale' : 'retail',
            verification_status: userData.business_name ? 'pending' : 'approved',
            business_name: userData.business_name || '',
            gstin: userData.gstin || ''
          };
          setUser(mapped);
          localStorage.setItem('mn_user', JSON.stringify(mapped));
          return { success: true, user: mapped };
        }
      } catch (err) {
        console.warn('Supabase sign-up error, trying local backend:', err.message);
      }
    }

    // Default to local backend API
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user: newUser } = res.data;
      localStorage.setItem('mn_token', token);
      localStorage.setItem('mn_user', JSON.stringify(newUser));
      setUser(newUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed.');
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

  const isAdmin = user && user.role === 'admin';
  const isWholesale = user && user.account_type === 'wholesale';
  const isWholesaleApproved = isWholesale && user.verification_status === 'approved';
  const isWholesalePending = isWholesale && user.verification_status === 'pending';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      ownerLogin,
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
