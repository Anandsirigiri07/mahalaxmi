import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('YOUR_')
);

let supabaseInstance = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.info('👑 Supabase client successfully initialized for Mahalaxmi Novelties.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.info(
    'ℹ️ Supabase credentials not set in frontend/.env. Running with local authentication and database session mode.'
  );
}

export const supabase = supabaseInstance;

/**
 * Sign up a new user via Supabase Auth
 */
export async function supabaseSignUp({ email, password, full_name, phone, role = 'retail', business_name = '', gstin = '' }) {
  if (supabaseInstance) {
    const { data, error } = await supabaseInstance.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          role,
          business_name,
          gstin,
          is_verified_wholesale: false
        }
      }
    });
    if (error) throw error;
    return data;
  }
  return null;
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function supabaseSignIn({ email, password }) {
  if (supabaseInstance) {
    const { data, error } = await supabaseInstance.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }
  return null;
}

/**
 * Sign in user via Google OAuth (Supabase)
 */
export async function supabaseSignInWithGoogle() {
  if (supabaseInstance) {
    const { data, error } = await supabaseInstance.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/account`
      }
    });
    if (error) throw error;
    return data;
  }
  return null;
}

/**
 * Sign out current user from Supabase Auth
 */
export async function supabaseSignOut() {
  if (supabaseInstance) {
    const { error } = await supabaseInstance.auth.signOut();
    if (error) throw error;
  }
}

/**
 * Get current session from Supabase
 */
export async function supabaseGetSession() {
  if (supabaseInstance) {
    const { data, error } = await supabaseInstance.auth.getSession();
    if (error) throw error;
    return data.session;
  }
  return null;
}

/**
 * Listen to auth state changes from Supabase
 */
export function supabaseOnAuthStateChange(callback) {
  if (supabaseInstance) {
    const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => subscription.unsubscribe();
  }
  return () => {};
}
