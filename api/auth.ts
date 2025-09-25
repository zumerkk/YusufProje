/**
 * Consolidated Auth API handler for Vercel
 * Combines login, logout, register, and me endpoints into a single serverless function
 */
import type { Request, Response } from 'express';
import { supabase } from './config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Set CORS headers helper
const setCorsHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Login handler
const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // JWT token oluştur
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role || 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register handler
const handleRegister = async (req: Request, res: Response) => {
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
};

// Me handler
const handleMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active, created_at')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // Get student data if user is a student
    let studentData = null;
    if (userData.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('grade_level, school_name, parent_phone')
        .eq('user_id', userData.id)
        .single();
      studentData = student;
    }

    // Get teacher data if user is a teacher
    let teacherData = null;
    if (userData.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select(`
          bio,
          experience_years,
          education,
          hourly_rate,
          rating,
          total_reviews,
          is_verified,
          availability_status,
          teacher_subjects(
            subject_name,
            proficiency_level,
            years_experience
          )
        `)
        .eq('user_id', userData.id)
        .single();
      
      // Extract the first subject as the main subject
      const subject = teacher?.teacher_subjects?.[0]?.subject_name || null;
      
      teacherData = {
        ...teacher,
        subject: subject,
        teacher_subjects: teacher?.teacher_subjects || []
      };
    }

    res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active,
        created_at: userData.created_at,
        profile: profileData,
        student: studentData,
        teacher: teacherData
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Logout handler
const handleLogout = async (req: Request, res: Response) => {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // This endpoint just confirms the logout action
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Main handler function
export default async function handler(req: Request, res: Response) {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route based on URL path
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (path.endsWith('/login')) {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleLogin(req, res);
    } else if (path.endsWith('/register')) {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleRegister(req, res);
    } else if (path.endsWith('/me')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleMe(req, res);
    } else if (path.endsWith('/logout')) {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleLogout(req, res);
    } else {
      res.status(404).json({ error: 'Auth endpoint not found' });
    }
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}