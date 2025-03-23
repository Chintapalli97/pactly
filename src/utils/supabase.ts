
import { createClient } from '@supabase/supabase-js';

// Use the environment variables from the Supabase integration
const supabaseUrl = "https://oucmazklprhmpjexekei.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y21hemtscHJobXBqZXhla2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTIyNzQsImV4cCI6MjA1ODIyODI3NH0.TQHwrinpaeBAcT52r9vrndQPPh5Iuf44oWJZ_eJvVAw";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export default supabase;
