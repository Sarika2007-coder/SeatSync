import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Default placeholders. Prefer setting `window.__SUPABASE_CONFIG` before importing this module.
const DEFAULT_SUPABASE_URL = 'https://ibumbahrxzxtqruaas.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_RWynYaT0C5XN-JcYKYrO4g_kTikiUwa';
const _cfg = (typeof window !== 'undefined' && window.__SUPABASE_CONFIG) ? window.__SUPABASE_CONFIG : {};
const SUPABASE_URL = _cfg.url || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = _cfg.anonKey || DEFAULT_SUPABASE_ANON_KEY;

if (SUPABASE_URL.includes('YOUR_SUPABASE') || SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
    console.warn('Supabase client not configured. Set `window.__SUPABASE_CONFIG = { url: "https://...", anonKey: "..." }` in a script before loading js/supabase-client.js');
}

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