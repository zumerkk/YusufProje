/**
 * Vercel serverless function for getting current user
 */
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

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
      console.log('Fetching student data for user_id:', userData.id);
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('grade_level, school_name, parent_phone')
        .eq('user_id', userData.id)
        .single();
      console.log('Student query result:', { student, studentError });
      studentData = student;
    }

    // Get teacher data if user is a teacher
    let teacherData = null;
    if (userData.role === 'teacher') {
      console.log('Fetching teacher data for user_id:', userData.id);
      const { data: teacher, error: teacherError } = await supabase
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
      
      console.log('Teacher query result:', { teacher, teacherError });
      
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
}