import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jquwjufwuxiiumnzqwjn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxdXdqdWZ3dXhpaXVubXpxd2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzkyNDMsImV4cCI6MjA2ODQ1NTI0M30.1KtaM_wl4ynl3YEo7poBuLsVVUXJEkZ5Wjc7qwOxyCI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)