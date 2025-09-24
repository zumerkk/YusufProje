import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminPassword() {
  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update admin user password
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@example.com')
      .select()
      .single();

    if (userError) {
      console.error('Error updating user:', userError);
      return;
    }

    console.log('Admin password updated successfully:', user);
    console.log('\nAdmin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdminPassword();