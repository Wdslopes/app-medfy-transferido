import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criar cliente com valores padrão se não configurado
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  specialty: string | null;
  crm: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  type: 'laudo' | 'receita' | 'relatorio';
  subtype: string;
  patient_name: string;
  patient_info: any;
  content: string | null;
  status: 'completed' | 'pending' | 'draft';
  created_at: string;
  updated_at: string;
}
