import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dtqxhwmkfygtaiijjyle.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cXhod21rZnlndGFpaWpqeWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODMyMzMsImV4cCI6MjA5MDk1OTIzM30.OQ_1oZDRwSud9avHLsEOb4XlQMsTzNTkie7Am-u1Bow";

// Clear any corrupted/expired Supabase sessions from localStorage
try {
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    const session = JSON.parse(raw);
    const expiresAt = session?.expires_at;
    if (expiresAt && expiresAt < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(storageKey);
    }
  }
} catch {}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});