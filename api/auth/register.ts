/**
 * Vercel serverless function for user registration
 */
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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
    const { email, password, role, firstName, lastName, grade, subject } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Grade validation for students
    if (role === 'student' && !grade) {
      res.status(400).json({ error: 'Grade is required for students' });
      return;
    }

    // Subject validation for teachers
    if (role === 'teacher' && !subject) {
      res.status(400).json({ error: 'Subject is required for teachers' });
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
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    // Profile creation removed - using user table only

    // Create student record if role is student
    if (role === 'student') {
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: userData.id,
          grade_level: grade
        });

      if (studentError) {
        console.error('Student creation error:', studentError);
        // Clean up user if student creation fails
        await supabase.from('users').delete().eq('id', userData.id);
        res.status(500).json({ error: 'Failed to create student record' });
        return;
      }
    }

    // Create teacher record if role is teacher
    if (role === 'teacher') {
      // First create teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: userData.id
        })
        .select()
        .single();

      if (teacherError) {
        console.error('Teacher creation error:', teacherError);
        // Clean up user if teacher creation fails
        await supabase.from('users').delete().eq('id', userData.id);
        res.status(500).json({ error: 'Failed to create teacher record' });
        return;
      }

      // Then create teacher subject record
      const { error: subjectError } = await supabase
        .from('teacher_subjects')
        .insert({
          teacher_id: teacherData.id,
          subject_name: subject
        });

      if (subjectError) {
        console.error('Teacher subject creation error:', subjectError);
        // Clean up teacher and user if subject creation fails
        await supabase.from('teachers').delete().eq('id', teacherData.id);
        await supabase.from('users').delete().eq('id', userData.id);
        res.status(500).json({ error: 'Failed to create teacher subject record' });
        return;
      }
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
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}