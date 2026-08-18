import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const _cfg = (typeof window !== 'undefined' && window.__SUPABASE_CONFIG)
  ? window.__SUPABASE_CONFIG
  : {};

const SUPABASE_URL = _cfg.url || 'https://ibumbahrzxztxtqruaas.supabase.co';
const SUPABASE_ANON_KEY = _cfg.anonKey || 'sb_publishable_RWynYaT0C5XN-JcYKYrO4g_kTikiUwa';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabase;

window.supabaseAuth = {
    getCurrentUser: async function () {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Supabase auth session error:', error);
            return null;
        }
        return data?.session?.user ?? null;
    },
    signInUser: async function (email, password) {
        return await supabase.auth.signInWithPassword({ email, password });
    },
    signUpUser: async function (email, password) {
        return await supabase.auth.signUp({ email, password });
    },
    signOutUser: async function () {
        return await supabase.auth.signOut();
    },
    getSession: async function () {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Supabase session error:', error);
            return null;
        }
        return data?.session ?? null;
    }
};

window.supabaseClientReady = true;
