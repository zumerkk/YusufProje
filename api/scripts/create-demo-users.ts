/**
 * Script to create demo users in Supabase Auth
 * This script creates demo users that can be used for testing
 */
import { supabase } from '../config/supabase';
import type { UserInsert, ProfileInsert } from '../../shared/types/database';
import bcrypt from 'bcryptjs';

interface DemoUser {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  first_name: string;
  last_name: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    first_name: 'Demo',
    last_name: 'Student'
  },
  {
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher',
    first_name: 'Demo',
    last_name: 'Teacher'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    first_name: 'Demo',
    last_name: 'Admin'
  }
];

async function createDemoUsers() {
  console.log('Creating demo users...');

  for (const user of demoUsers) {
    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      if (!authData.user) {
        console.error(`Failed to create auth user ${user.email}`);
        continue;
      }

      // Hash the password for the users table
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Create user record in users table
      const userData: UserInsert = {
        id: authData.user.id,
        email: user.email,
        role: user.role,
        password_hash: passwordHash
      };

      const { error: userError } = await supabase
        .from('users')
        .insert(userData);

      if (userError) {
        console.error(`Error creating user record ${user.email}:`, userError.message);
        // Delete the auth user if user record creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      // Create profile record
      const profileData: ProfileInsert = {
        user_id: authData.user.id,
        first_name: user.first_name,
        last_name: user.last_name
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error(`Error creating profile ${user.email}:`, profileError.message);
      }

      console.log(`✓ Created demo user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`Unexpected error creating user ${user.email}:`, error);
    }
  }

  console.log('Demo users creation completed!');
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { createDemoUsers };