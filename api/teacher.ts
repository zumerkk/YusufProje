/**
 * Consolidated Teacher API handler for Vercel
 * Combines activities, assignments, attendance, classes, grades, lessons, reports, and students endpoints
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

// Students handlers
const handleGetTeacherStudents = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    
    const { data: students, error } = await supabase
      .from('class_students')
      .select(`
        *,
        profiles!class_students_student_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        teacher_classes!class_students_class_id_fkey(
          id,
          class_name,
          subject_id
        )
      `)
      .eq('teacher_classes.teacher_id', teacherId);

    if (error) {
      console.error('Error fetching teacher students:', error);
      return res.status(500).json({ error: 'Öğrenciler getirilirken hata oluştu' });
    }

    res.json({ students });
  } catch (error) {
    console.error('Teacher students error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleAddStudentToClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { student_id } = req.body;

    // Check if student is already in class
    const { data: existingStudent } = await supabase
      .from('class_students')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', student_id)
      .single();

    if (existingStudent) {
      return res.status(400).json({ error: 'Öğrenci zaten bu sınıfta kayıtlı' });
    }

    const { data: newStudent, error } = await supabase
      .from('class_students')
      .insert({
        class_id: classId,
        student_id,
        enrolled_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles!class_students_student_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error adding student to class:', error);
      return res.status(500).json({ error: 'Öğrenci sınıfa eklenirken hata oluştu' });
    }

    res.status(201).json({ student: newStudent, message: 'Öğrenci başarıyla sınıfa eklendi' });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleRemoveStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { classId, studentId } = req.params;

    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error removing student from class:', error);
      return res.status(500).json({ error: 'Öğrenci sınıftan çıkarılırken hata oluştu' });
    }

    res.json({ message: 'Öğrenci başarıyla sınıftan çıkarıldı' });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Lessons handlers
const handleGetTeacherLessons = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    
    // Get teacher's subject info
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, subject')
      .eq('user_id', teacherId)
      .single();

    if (teacherError || !teacher) {
      console.error('Error fetching teacher:', teacherError);
      return res.status(500).json({ error: 'Öğretmen bilgileri alınamadı' });
    }

    // Get teacher's lessons
    let query = supabase
      .from('lessons')
      .select(`
        *,
        students(
          id,
          grade_level,
          school_name,
          users(
            full_name
          )
        )
      `)
      .eq('teacher_id', teacher.id)
      .order('lesson_date', { ascending: true });

    // Filter by subject if teacher has one
    if (teacher?.subject) {
      query = query.eq('subject', teacher.subject);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error('Error fetching teacher lessons:', error);
      return res.status(500).json({ error: 'Dersler getirilirken hata oluştu' });
    }

    res.json({ 
      lessons,
      teacher_subject: teacher?.subject || null
    });
  } catch (error) {
    console.error('Teacher lessons error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleCreateLesson = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const { 
      day_of_week,
      class_level,
      class_section,
      subject,
      lesson_date, 
      start_time, 
      end_time,
      duration_minutes,
      lesson_notes
    } = req.body;

    // Get teacher's subject info
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, subject')
      .eq('user_id', teacherId)
      .single();

    if (teacherError || !teacher) {
      console.error('Error fetching teacher record:', teacherError);
      return res.status(500).json({ error: 'Öğretmen kaydı bulunamadı' });
    }

    // Find students in the selected class
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, user_id, users(full_name)')
      .eq('grade_level', class_level)
      .eq('class_section', class_section);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return res.status(500).json({ error: 'Öğrenci bilgileri alınamadı' });
    }

    if (!students || students.length === 0) {
      return res.status(404).json({ error: 'Bu sınıfta öğrenci bulunamadı' });
    }

    // Create lesson records for each student
    const lessonPromises = students.map(student => {
      return supabase
        .from('lessons')
        .insert({
          teacher_id: teacher.id,
          student_id: student.id,
          subject: subject || teacher.subject,
          lesson_date: lesson_date,
          start_time: start_time,
          end_time: end_time,
          duration_minutes: duration_minutes || 60,
          status: 'scheduled',
          lesson_notes: lesson_notes,
          class_level: class_level,
          class_section: class_section,
          day_of_week: day_of_week,
          price: 0, // Class lessons are free
          payment_status: 'completed'
        })
        .select('*')
        .single();
    });

    // Create all lesson records
    const lessonResults = await Promise.all(lessonPromises);
    
    // Check for errors
    const errors = lessonResults.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error creating lessons:', errors);
      return res.status(500).json({ error: 'Bazı dersler oluşturulurken hata oluştu' });
    }

    const createdLessons = lessonResults.map(result => result.data);

    res.status(201).json({ 
      lessons: createdLessons,
      message: `${createdLessons.length} öğrenci için ders başarıyla oluşturuldu`,
      class_info: {
        level: class_level,
        section: class_section,
        student_count: students.length
      }
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Grades handlers
const handleGetTeacherGrades = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { class_id, subject_id } = req.query;
    
    let query = supabase
      .from('student_grades')
      .select(`
        *,
        profiles!student_grades_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        teacher_assignments!student_grades_assignment_id_fkey(
          id,
          title,
          max_points,
          assignment_type
        ),
        teacher_classes!student_grades_class_id_fkey(
          id,
          class_name
        ),
        teacher_subjects!student_grades_subject_id_fkey(
          id,
          subject_name
        )
      `)
      .eq('teacher_id', teacherId);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    const { data: grades, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teacher grades:', error);
      return res.status(500).json({ error: 'Notlar getirilirken hata oluştu' });
    }

    res.json({ grades });
  } catch (error) {
    console.error('Teacher grades error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleAddGrade = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { 
      student_id, 
      class_id, 
      subject_id, 
      assignment_id, 
      grade, 
      max_points,
      grade_type,
      description,
      feedback 
    } = req.body;

    const { data: newGrade, error } = await supabase
      .from('student_grades')
      .insert({
        teacher_id: teacherId,
        student_id,
        class_id,
        subject_id,
        assignment_id,
        grade,
        max_points: max_points || 100,
        grade_type: grade_type || 'assignment',
        description,
        feedback,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles!student_grades_student_id_fkey(
          first_name,
          last_name,
          email
        ),
        teacher_assignments!student_grades_assignment_id_fkey(
          title,
          assignment_type
        )
      `)
      .single();

    if (error) {
      console.error('Error adding grade:', error);
      return res.status(500).json({ error: 'Not eklenirken hata oluştu' });
    }

    res.status(201).json({ grade: newGrade, message: 'Not başarıyla eklendi' });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Classes handlers
const handleGetTeacherClasses = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    
    // Get teacher record
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', teacherId)
      .single();

    if (teacherError || !teacher) {
      console.error('Error fetching teacher:', teacherError);
      return res.status(500).json({ error: 'Öğretmen bilgileri alınamadı' });
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        class_students(
          id,
          student_id,
          profiles!class_students_student_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .eq('teacher_id', teacher.id);

    if (error) {
      console.error('Error fetching teacher classes:', error);
      return res.status(500).json({ error: 'Sınıflar getirilirken hata oluştu' });
    }

    res.json({ classes });
  } catch (error) {
    console.error('Teacher classes error:', error);
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
    // Students endpoints
    if (path.includes('/students') && path.includes('/teachers/')) {
      const teacherId = path.split('/teachers/')[1]?.split('/')[0];
      if (req.method === 'GET') {
        req.params = { ...req.params, teacherId };
        await handleGetTeacherStudents(req, res);
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } else if (path.includes('/classes/') && path.includes('/students') && req.method === 'POST') {
      const classId = path.split('/classes/')[1]?.split('/')[0];
      req.params = { ...req.params, classId };
      await handleAddStudentToClass(req, res);
    } else if (path.includes('/classes/') && path.includes('/students/') && req.method === 'DELETE') {
      const pathParts = path.split('/');
      const classId = pathParts[pathParts.indexOf('classes') + 1];
      const studentId = pathParts[pathParts.indexOf('students') + 1];
      req.params = { ...req.params, classId, studentId };
      await handleRemoveStudentFromClass(req, res);
    }
    // Lessons endpoints
    else if (path.includes('/lessons')) {
      if (req.method === 'GET') {
        await handleGetTeacherLessons(req, res);
      } else if (req.method === 'POST') {
        await handleCreateLesson(req, res);
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    }
    // Grades endpoints
    else if (path.includes('/grades') && path.includes('/teachers/')) {
      const teacherId = path.split('/teachers/')[1]?.split('/')[0];
      req.params = { ...req.params, teacherId };
      if (req.method === 'GET') {
        await handleGetTeacherGrades(req, res);
      } else if (req.method === 'POST') {
        await handleAddGrade(req, res);
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    }
    // Classes endpoints
    else if (path.includes('/classes') && req.method === 'GET') {
      await handleGetTeacherClasses(req, res);
    } else {
      res.status(404).json({ error: 'Teacher endpoint not found' });
    }
  } catch (error) {
    console.error('Teacher handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}