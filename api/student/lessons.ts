import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get lessons for student
const getLessons = async (studentUserId: string) => {
  try {
    // First get the student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentUserId)
      .single();

    if (studentError || !studentData) {
      throw new Error('Student not found');
    }

    // Get lessons for this student with teacher information
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        teacher_id,
        student_id,
        subject,
        lesson_date,
        duration_minutes,
        status,
        lesson_notes,
        price,
        payment_status,
        class_level,
        class_section,
        lesson_type,
        created_at,
        updated_at,
        teachers!inner (
          id,
          user_id,
          users!inner (
            id,
            email,
            profiles!inner (
              first_name,
              last_name
            )
          )
        )
      `)
      .eq('student_id', studentData.id)
      .order('lesson_date', { ascending: true });

    if (lessonsError) {
      throw lessonsError;
    }

    // Format lessons data
    const formattedLessons = lessons?.map(lesson => ({
      id: lesson.id,
      teacher_id: lesson.teacher_id,
      student_id: lesson.student_id,
      subject: lesson.subject,
      date_time: lesson.lesson_date,
      duration_minutes: lesson.duration_minutes,
      status: lesson.status,
      notes: lesson.lesson_notes,
      price: lesson.price,
      payment_status: lesson.payment_status,
      class_level: lesson.class_level,
      class_section: lesson.class_section,
      lesson_type: lesson.lesson_type,
      teacher_name: lesson.teachers?.users?.profiles ? 
        `${lesson.teachers.users.profiles.first_name} ${lesson.teachers.users.profiles.last_name}` : 
        'Unknown Teacher',
      created_at: lesson.created_at,
      updated_at: lesson.updated_at
    })) || [];

    return formattedLessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const getStudentLessons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== Student Lessons API Called ===');
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    // Check if user is authenticated (middleware should handle this)
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      console.log('User role is not student:', req.user.role);
      return res.status(403).json({ error: 'Access denied. Student role required.' });
    }

    console.log('Fetching lessons for user ID:', req.user.id);
    const lessons = await getLessons(req.user.id);
    console.log('Lessons fetched successfully:', lessons.length);
    
    res.status(200).json({
      success: true,
      lessons: lessons
    });
  } catch (error) {
    console.error('Error in lessons API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};