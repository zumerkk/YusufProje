import { supabase } from './config/supabase.ts';

async function getStudentId() {
  try {
    console.log('Getting student users...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'student')
      .limit(5);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Students found:', data?.length || 0);
    console.log('Students:', data);
    
    if (data && data.length > 0) {
      console.log('\nFirst student ID:', data[0].id);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getStudentId();