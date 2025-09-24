import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenin derslerini getir (branşına göre filtrelenmiş)
export const getTeacherLessons = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    
    // Önce öğretmenin branş bilgisini ve ID'sini al
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, subject')
      .eq('user_id', teacherId)
      .single();

    if (teacherError || !teacher) {
      console.error('Error fetching teacher:', teacherError);
      return res.status(500).json({ error: 'Öğretmen bilgileri alınamadı' });
    }

    // Öğretmenin derslerini getir
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

    // Eğer öğretmenin branşı varsa, sadece o branştaki dersleri getir
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

// Yeni ders oluştur (öğretmen ve öğrenci programına ekle)
export const createLesson = async (req: Request, res: Response) => {
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

    // Önce öğretmenin branş bilgisini kontrol et
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('subject')
      .eq('user_id', teacherId)
      .single();

    if (teacherError) {
      console.error('Error fetching teacher subject:', teacherError);
      return res.status(500).json({ error: 'Öğretmen bilgileri alınamadı' });
    }

    // Önce öğretmen kaydını bul
    const { data: teacherRecord, error: teacherRecordError } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', teacherId)
      .single();

    if (teacherRecordError || !teacherRecord) {
      console.error('Error fetching teacher record:', teacherRecordError);
      return res.status(500).json({ error: 'Öğretmen kaydı bulunamadı' });
    }

    // Seçilen sınıftaki öğrencileri bul
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

    // Her öğrenci için ders kaydı oluştur
    const lessonPromises = students.map(student => {
      return supabase
        .from('lessons')
        .insert({
          teacher_id: teacherRecord.id,
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
          price: 0, // Sınıf dersleri ücretsiz
          payment_status: 'completed'
        })
        .select('*')
        .single();
    });

    // Tüm ders kayıtlarını oluştur
    const lessonResults = await Promise.all(lessonPromises);
    
    // Hata kontrolü
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

// Ders güncelle
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { 
      lesson_title, 
      lesson_content, 
      lesson_date, 
      start_time, 
      end_time,
      lesson_type 
    } = req.body;

    const { data: updatedLesson, error } = await supabase
      .from('lessons')
      .update({
        student_id: req.body.student_id,
        subject: req.body.subject,
        lesson_date: req.body.lesson_date,
        duration_minutes: req.body.duration_minutes,
        status: req.body.status,
        lesson_notes: req.body.lesson_notes,
        homework_assigned: req.body.homework_assigned,
        price: req.body.price,
        payment_status: req.body.payment_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating lesson:', error);
      return res.status(500).json({ error: 'Ders güncellenirken hata oluştu' });
    }

    res.json({ lesson: updatedLesson, message: 'Ders başarıyla güncellendi' });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ders sil
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const teacherId = req.user?.id;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error deleting lesson:', error);
      return res.status(500).json({ error: 'Ders silinirken hata oluştu' });
    }

    res.json({ message: 'Ders başarıyla silindi' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ders detaylarını getir
export const getLessonDetail = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        students(
          id,
          grade_level,
          school_name,
          parent_name,
          parent_phone,
          parent_email,
          learning_goals,
          users(
            profiles(
              first_name,
              last_name,
              email
            )
          )
        )
      `)
      .eq('id', lessonId)
      .eq('teacher_id', req.user?.id)
      .single();

    if (error) {
      console.error('Error fetching lesson detail:', error);
      return res.status(500).json({ error: 'Ders detayları getirilirken hata oluştu' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Lesson detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Haftalık ders programını getir
export const getWeeklySchedule = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { week_start } = req.query;

    if (!week_start) {
      return res.status(400).json({ error: 'Hafta başlangıç tarihi gerekli' });
    }

    const weekStart = new Date(week_start as string);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { data: lessons, error } = await supabase
      .from('teacher_lessons')
      .select(`
        *,
        teacher_classes!teacher_lessons_class_id_fkey(
          class_name
        ),
        teacher_subjects!teacher_lessons_subject_id_fkey(
          subject_name
        )
      `)
      .eq('teacher_id', teacherId)
      .gte('lesson_date', weekStart.toISOString().split('T')[0])
      .lte('lesson_date', weekEnd.toISOString().split('T')[0])
      .order('lesson_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching weekly schedule:', error);
      return res.status(500).json({ error: 'Haftalık program getirilirken hata oluştu' });
    }

    res.json({ lessons, week_start: weekStart, week_end: weekEnd });
  } catch (error) {
    console.error('Weekly schedule error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ders türlerini getir
export const getLessonTypes = async (req: Request, res: Response) => {
  try {
    const lessonTypes = [
      { value: 'normal', label: 'Normal Ders' },
      { value: 'exam', label: 'Sınav' },
      { value: 'quiz', label: 'Quiz' },
      { value: 'presentation', label: 'Sunum' },
      { value: 'lab', label: 'Laboratuvar' },
      { value: 'field_trip', label: 'Gezi' },
      { value: 'review', label: 'Tekrar' }
    ];

    res.json({ lesson_types: lessonTypes });
  } catch (error) {
    console.error('Lesson types error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};