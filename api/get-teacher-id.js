import { supabase } from './config/supabase.ts';

async function getTeacherId() {
  try {
    console.log('Getting teacher users...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'teacher')
      .limit(5);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Teachers found:', data?.length || 0);
    console.log('Teachers:', data);
    
    if (data && data.length > 0) {
      console.log('\nFirst teacher ID:', data[0].id);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getTeacherId();