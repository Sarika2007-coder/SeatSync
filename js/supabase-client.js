import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Config is injected by the server via /js/env-config.js before this module loads
const cfg = (typeof window !== 'undefined' && window.__SUPABASE_CONFIG) || {};
const SUPABASE_URL = cfg.url || '';
const SUPABASE_ANON_KEY = cfg.anonKey || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase not configured. Update SUPABASE_URL and SUPABASE_ANON_KEY in the .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabase;

window.supabaseAuth = {
    getCurrentUser: async function () {
        const { data, error } = await supabase.auth.getSession();
        if (error) { console.error('Session error:', error); return null; }
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
        if (error) { console.error('Session error:', error); return null; }
        return data?.session ?? null;
    }
};

window.supabaseClientReady = true;