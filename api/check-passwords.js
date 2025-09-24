import { supabase } from './config/supabase.ts';
import bcrypt from 'bcryptjs';

async function checkPasswords() {
  try {
    console.log('Checking user passwords...');
    
    const { data, error } = await supabase
      .from('users')
      .select('email, password_hash')
      .limit(3);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Users found:', data?.length || 0);
    
    for (const user of data || []) {
      console.log(`\nUser: ${user.email}`);
      console.log(`Hash: ${user.password_hash}`);
      
      // Test common passwords
      const testPasswords = ['password123', 'demo123456', 'test123', 'admin123'];
      
      for (const password of testPasswords) {
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
          console.log(`✓ Password found: ${password}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPasswords();