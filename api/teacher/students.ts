import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenin öğrencilerini getir
export const getTeacherStudents = async (req: Request, res: Response) => {
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

// Sınıfa öğrenci ekle
export const addStudentToClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { student_id } = req.body;

    // Öğrencinin zaten sınıfta olup olmadığını kontrol et
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

// Sınıftan öğrenci çıkar
export const removeStudentFromClass = async (req: Request, res: Response) => {
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

// Öğrenci detaylarını getir
export const getStudentDetail = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const { data: student, error } = await supabase
      .from('profiles')
      .select(`
        *,
        class_students(
          id,
          enrolled_at,
          teacher_classes(
            id,
            class_name,
            subject_id
          )
        ),
        student_grades(
          id,
          grade,
          assignment_id,
          created_at
        )
      `)
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student detail:', error);
      return res.status(500).json({ error: 'Öğrenci detayları getirilirken hata oluştu' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Student detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıftaki öğrencileri getir
export const getClassStudents = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

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
        )
      `)
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching class students:', error);
      return res.status(500).json({ error: 'Sınıf öğrencileri getirilirken hata oluştu' });
    }

    res.json({ students });
  } catch (error) {
    console.error('Class students error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Öğrenci arama
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Arama terimi gerekli' });
    }

    const { data: students, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'student')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);

    if (error) {
      console.error('Error searching students:', error);
      return res.status(500).json({ error: 'Öğrenci arama hatası' });
    }

    res.json({ students });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};