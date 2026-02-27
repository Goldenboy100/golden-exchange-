import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://gkvbfjpovmhuajpiihm.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdmJmanBvdm1odWFqcGJpaWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc2ODQsImV4cCI6MjA4NzE1MzY4NH0.pQ8bGA-qFcNdCZ4WzqrekhtrYgGgcqDZfr4gxmJe2WY';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && !!supabase;
};
