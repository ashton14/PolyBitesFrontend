import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://xarxwnblcalhntwzilju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhcnh3bmJsY2FsaG50d3ppbGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MzcwMDQsImV4cCI6MjA2NDQxMzAwNH0.dhj0cCiBgjkHimp0Fh6NmiDYkn927CAoMzsYBlElR-E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);