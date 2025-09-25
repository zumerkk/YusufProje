/**
 * Consolidated Admin API handler for Vercel
 * Combines users, classes, moderation, security, and audit endpoints into a single serverless function
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

// Users handlers
const handleGetTeachers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        teachers (
          id,
          bio,
          experience_years,
          education,
          hourly_rate,
          rating,
          total_reviews,
          is_verified,
          availability_status
        )
      `)
      .eq('role', 'teacher');

    // Search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Sorting
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: teachers, error } = await query;

    if (error) {
      console.error('Get teachers error:', error);
      return res.status(500).json({ error: 'Öğretmenler getirilemedi' });
    }

    // Total count query
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%`);
    }
    if (status && status !== 'all') {
      countQuery = countQuery.eq('is_active', status === 'active');
    }

    const { count: totalCount } = await countQuery;

    res.json({
      teachers,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      },
      filters: {
        search,
        status,
        sort_by,
        sort_order
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleGetStudents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        students (
          id,
          grade_level,
          school_name,
          parent_name,
          parent_phone,
          parent_email,
          learning_goals,
          class_section
        )
      `)
      .eq('role', 'student');

    // Search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Sorting
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: students, error } = await query;

    if (error) {
      console.error('Get students error:', error);
      return res.status(500).json({ error: 'Öğrenciler getirilemedi' });
    }

    // Total count query
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%`);
    }
    if (status && status !== 'all') {
      countQuery = countQuery.eq('is_active', status === 'active');
    }

    const { count: totalCount } = await countQuery;

    res.json({
      students,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      },
      filters: {
        search,
        status,
        sort_by,
        sort_order
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleGetAnalytics = async (req: Request, res: Response) => {
  try {
    // User statistics
    const { data: userStats } = await supabase
      .from('users')
      .select('role, is_active');

    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => u.is_active === true).length || 0;
    const totalTeachers = userStats?.filter(u => u.role === 'teacher').length || 0;
    const totalStudents = userStats?.filter(u => u.role === 'student').length || 0;
    const activeTeachers = userStats?.filter(u => u.role === 'teacher' && u.is_active === true).length || 0;
    const activeStudents = userStats?.filter(u => u.role === 'student' && u.is_active === true).length || 0;

    // Package statistics
    const { data: packageStats } = await supabase
      .from('student_packages')
      .select('status, purchase_date');

    const totalPackages = packageStats?.length || 0;
    const activePackages = packageStats?.filter(p => p.status === 'active').length || 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        teachers: {
          total: totalTeachers,
          active: activeTeachers
        },
        students: {
          total: totalStudents,
          active: activeStudents
        }
      },
      packages: {
        total: totalPackages,
        active: activePackages
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Classes handlers
const handleGetClassLevels = async (req: Request, res: Response) => {
  try {
    const { data: classLevels, error } = await supabase
      .from('students')
      .select('grade_level')
      .not('grade_level', 'is', null);

    if (error) {
      console.error('Error fetching class levels:', error);
      return res.status(500).json({ error: 'Sınıf seviyeleri alınamadı' });
    }

    const uniqueLevels = [...new Set(classLevels.map(item => item.grade_level))]
      .filter(level => level !== null)
      .sort((a, b) => a - b);

    res.json({ class_levels: uniqueLevels });
  } catch (error) {
    console.error('Get class levels error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleCreateClass = async (req: Request, res: Response) => {
  try {
    const { grade_level, class_section, teacher_id } = req.body;

    if (!grade_level || !class_section || !teacher_id) {
      return res.status(400).json({ error: 'Sınıf seviyesi, şube ve öğretmen ID gerekli' });
    }

    // Check if class already exists
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('grade_level', grade_level)
      .eq('class_section', class_section)
      .single();

    if (existingClass) {
      return res.status(409).json({ error: 'Bu sınıf zaten mevcut' });
    }

    // Create new class
    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        grade_level,
        class_section,
        teacher_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      return res.status(500).json({ error: 'Sınıf oluşturulamadı' });
    }

    res.status(201).json({ 
      message: 'Sınıf başarıyla oluşturuldu',
      class: newClass 
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Security handlers
const handleSecurityLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, level, start_date, end_date } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching security logs:', error);
      return res.status(500).json({ error: 'Güvenlik logları alınamadı' });
    }

    res.json({ logs });
  } catch (error) {
    console.error('Get security logs error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Moderation handlers
const handleGetReports = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({ error: 'Raporlar alınamadı' });
    }

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
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
    // Users endpoints
    if (path.includes('/users/teachers')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleGetTeachers(req, res);
    } else if (path.includes('/users/students')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleGetStudents(req, res);
    } else if (path.includes('/users/analytics')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleGetAnalytics(req, res);
    }
    // Classes endpoints
    else if (path.includes('/classes/levels')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleGetClassLevels(req, res);
    } else if (path.includes('/classes') && req.method === 'POST') {
      await handleCreateClass(req, res);
    }
    // Security endpoints
    else if (path.includes('/security/logs')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleSecurityLogs(req, res);
    }
    // Moderation endpoints
    else if (path.includes('/moderation/reports')) {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      await handleGetReports(req, res);
    } else {
      res.status(404).json({ error: 'Admin endpoint not found' });
    }
  } catch (error) {
    console.error('Admin handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}