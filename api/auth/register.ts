/**
 * Vercel serverless function for user registration
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
        email_verified: false
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userData.id,
        first_name: firstName,
        last_name: lastName
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up user if profile creation fails
      await supabase.from('users').delete().eq('id', userData.id);
      res.status(500).json({ error: 'Failed to create user profile' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        role: userData.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}