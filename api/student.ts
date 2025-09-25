/**
 * Consolidated Student API handler for Vercel
 * Combines lessons and packages endpoints into a single serverless function
 */
import type { Request, Response } from 'express';
import { supabase } from './config/supabase';
import { authenticateToken } from './middleware/auth';

// Set CORS headers helper
const setCorsHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Lessons handlers
const handleGetStudentLessons = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { status, start_date, end_date, page = 1, limit = 20 } = req.query;
    
    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Error fetching student:', studentError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('lessons')
      .select(`
        *,
        teachers(
          id,
          subject,
          users(
            full_name
          )
        )
      `)
      .eq('student_id', student.id)
      .order('lesson_date', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by date range
    if (start_date) {
      query = query.gte('lesson_date', start_date);
    }

    if (end_date) {
      query = query.lte('lesson_date', end_date);
    }

    // Pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: lessons, error } = await query;

    if (error) {
      console.error('Error fetching student lessons:', error);
      return res.status(500).json({ error: 'Dersler getirilirken hata oluştu' });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id);

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (start_date) {
      countQuery = countQuery.gte('lesson_date', start_date);
    }
    if (end_date) {
      countQuery = countQuery.lte('lesson_date', end_date);
    }

    const { count: totalCount } = await countQuery;

    res.json({ 
      lessons,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Student lessons error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleGetLessonDetail = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user?.id;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Error fetching student:', studentError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teachers(
          id,
          subject,
          users(
            full_name,
            email
          )
        )
      `)
      .eq('id', lessonId)
      .eq('student_id', student.id)
      .single();

    if (error) {
      console.error('Error fetching lesson detail:', error);
      return res.status(500).json({ error: 'Ders detayları getirilirken hata oluştu' });
    }

    if (!lesson) {
      return res.status(404).json({ error: 'Ders bulunamadı' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Lesson detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Packages handlers
const handleGetStudentPackages = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { status } = req.query;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Error fetching student:', studentError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    let query = supabase
      .from('student_packages')
      .select(`
        *,
        packages(
          id,
          name,
          description,
          price,
          lesson_count,
          duration_days,
          subject,
          grade_level
        )
      `)
      .eq('student_id', student.id)
      .order('purchase_date', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: packages, error } = await query;

    if (error) {
      console.error('Error fetching student packages:', error);
      return res.status(500).json({ error: 'Paketler getirilirken hata oluştu' });
    }

    res.json({ packages });
  } catch (error) {
    console.error('Student packages error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleGetPackageDetail = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const studentId = req.user?.id;

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Error fetching student:', studentError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    const { data: studentPackage, error } = await supabase
      .from('student_packages')
      .select(`
        *,
        packages(
          id,
          name,
          description,
          price,
          lesson_count,
          duration_days,
          subject,
          grade_level,
          features
        )
      `)
      .eq('id', packageId)
      .eq('student_id', student.id)
      .single();

    if (error) {
      console.error('Error fetching package detail:', error);
      return res.status(500).json({ error: 'Paket detayları getirilirken hata oluştu' });
    }

    if (!studentPackage) {
      return res.status(404).json({ error: 'Paket bulunamadı' });
    }

    // Get lessons for this package
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        lesson_date,
        start_time,
        end_time,
        status,
        subject,
        lesson_notes
      `)
      .eq('student_id', student.id)
      .eq('package_id', packageId)
      .order('lesson_date', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching package lessons:', lessonsError);
    }

    res.json({ 
      package: studentPackage,
      lessons: lessons || []
    });
  } catch (error) {
    console.error('Package detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleGetAvailablePackages = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { subject, grade_level } = req.query;

    // Get student record to check grade level
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, grade_level')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error('Error fetching student:', studentError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    let query = supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    // Filter by subject
    if (subject) {
      query = query.eq('subject', subject);
    }

    // Filter by grade level (use student's grade level if not specified)
    const targetGradeLevel = grade_level || student.grade_level;
    if (targetGradeLevel) {
      query = query.eq('grade_level', targetGradeLevel);
    }

    const { data: packages, error } = await query;

    if (error) {
      console.error('Error fetching available packages:', error);
      return res.status(500).json({ error: 'Paketler getirilirken hata oluştu' });
    }

    res.json({ packages });
  } catch (error) {
    console.error('Available packages error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
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
    // Lessons endpoints
    if (path.includes('/lessons')) {
      if (path.includes('/lessons/') && req.method === 'GET') {
        // Get specific lesson detail
        const lessonId = path.split('/lessons/')[1]?.split('/')[0];
        req.params = { ...req.params, lessonId };
        await handleGetLessonDetail(req, res);
      } else if (req.method === 'GET') {
        // Get all student lessons
        await handleGetStudentLessons(req, res);
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    }
    // Packages endpoints
    else if (path.includes('/packages')) {
      if (path.includes('/packages/available') && req.method === 'GET') {
        // Get available packages for purchase
        await handleGetAvailablePackages(req, res);
      } else if (path.includes('/packages/') && req.method === 'GET') {
        // Get specific package detail
        const packageId = path.split('/packages/')[1]?.split('/')[0];
        req.params = { ...req.params, packageId };
        await handleGetPackageDetail(req, res);
      } else if (req.method === 'GET') {
        // Get all student packages
        await handleGetStudentPackages(req, res);
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      res.status(404).json({ error: 'Student endpoint not found' });
    }
  } catch (error) {
    console.error('Student handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}