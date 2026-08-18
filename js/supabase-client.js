import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// TODO: Replace these values with your Supabase project URL and anon key.
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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