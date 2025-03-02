import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const testConnection = async () => {
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection test error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Connection test exception:', err);
    return { success: false, error: err };
  }
};


export const checkUser = async() => {
  try {
    const {data: {user}, error} = await supabase.auth.getUser()
    if (error) throw error
    return user
  }catch (error) {
    console.error('Error checking auth:', error) 
    return null
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }
  

