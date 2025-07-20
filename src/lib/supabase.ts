import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== '' && supabaseAnonKey !== '' &&
  supabaseUrl.includes('supabase.co');

// Create Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Database types
export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          title: string;
          description: string;
          starter_code: string;
          expected_output: string;
          difficulty: 'easy' | 'medium' | 'hard';
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          starter_code: string;
          expected_output: string;
          difficulty: 'easy' | 'medium' | 'hard';
          tags: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          starter_code?: string;
          expected_output?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          tags?: string[];
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          code: string;
          output: string;
          passed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          code: string;
          output: string;
          passed: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          code?: string;
          output?: string;
          passed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}