import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenin devam kayıtlarını getir
export const getTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { class_id, date_from, date_to, student_id } = req.query;
    
    let query = supabase
      .from('student_attendance')
      .select(`
        *,
        profiles!student_attendance_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        teacher_classes!student_attendance_class_id_fkey(
          id,
          class_name
        ),
        teacher_lessons!student_attendance_lesson_id_fkey(
          id,
          lesson_title,
          lesson_date,
          start_time,
          end_time
        )
      `)
      .eq('teacher_id', teacherId);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    
    if (student_id) {
      query = query.eq('student_id', student_id);
    }
    
    if (date_from) {
      query = query.gte('attendance_date', date_from);
    }
    
    if (date_to) {
      query = query.lte('attendance_date', date_to);
    }

    const { data: attendance, error } = await query.order('attendance_date', { ascending: false });

    if (error) {
      console.error('Error fetching teacher attendance:', error);
      return res.status(500).json({ error: 'Devam kayıtları getirilirken hata oluştu' });
    }

    res.json({ attendance });
  } catch (error) {
    console.error('Teacher attendance error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni devam kaydı ekle
export const addAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { 
      student_id, 
      class_id, 
      lesson_id,
      attendance_date, 
      status,
      notes,
      excuse_type,
      excuse_document 
    } = req.body;

    const { data: newAttendance, error } = await supabase
      .from('student_attendance')
      .insert({
        teacher_id: teacherId,
        student_id,
        class_id,
        lesson_id,
        attendance_date,
        status, // 'present', 'absent', 'late', 'excused'
        notes,
        excuse_type,
        excuse_document,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles!student_attendance_student_id_fkey(
          first_name,
          last_name,
          email
        ),
        teacher_classes!student_attendance_class_id_fkey(
          class_name
        ),
        teacher_lessons!student_attendance_lesson_id_fkey(
          lesson_title
        )
      `)
      .single();

    if (error) {
      console.error('Error adding attendance:', error);
      return res.status(500).json({ error: 'Devam kaydı eklenirken hata oluştu' });
    }

    res.status(201).json({ attendance: newAttendance, message: 'Devam kaydı başarıyla eklendi' });
  } catch (error) {
    console.error('Add attendance error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Devam kaydını güncelle
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes, excuse_type, excuse_document } = req.body;

    const { data: updatedAttendance, error } = await supabase
      .from('student_attendance')
      .update({
        status,
        notes,
        excuse_type,
        excuse_document,
        updated_at: new Date().toISOString()
      })
      .eq('id', attendanceId)
      .select(`
        *,
        profiles!student_attendance_student_id_fkey(
          first_name,
          last_name,
          email
        ),
        teacher_classes!student_attendance_class_id_fkey(
          class_name
        ),
        teacher_lessons!student_attendance_lesson_id_fkey(
          lesson_title
        )
      `)
      .single();

    if (error) {
      console.error('Error updating attendance:', error);
      return res.status(500).json({ error: 'Devam kaydı güncellenirken hata oluştu' });
    }

    res.json({ attendance: updatedAttendance, message: 'Devam kaydı başarıyla güncellendi' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Devam kaydını sil
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;

    const { error } = await supabase
      .from('student_attendance')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      console.error('Error deleting attendance:', error);
      return res.status(500).json({ error: 'Devam kaydı silinirken hata oluştu' });
    }

    res.json({ message: 'Devam kaydı başarıyla silindi' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Öğrenci devam istatistiklerini getir
export const getStudentAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { class_id, date_from, date_to } = req.query;

    let query = supabase
      .from('student_attendance')
      .select('status, attendance_date')
      .eq('student_id', studentId);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    
    if (date_from) {
      query = query.gte('attendance_date', date_from);
    }
    
    if (date_to) {
      query = query.lte('attendance_date', date_to);
    }

    const { data: attendance, error } = await query;

    if (error) {
      console.error('Error fetching student attendance stats:', error);
      return res.status(500).json({ error: 'Öğrenci devam istatistikleri getirilirken hata oluştu' });
    }

    // İstatistikleri hesapla
    const stats = {
      total_days: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    stats['attendance_rate'] = stats.total_days > 0 
      ? Math.round(((stats.present + stats.late + stats.excused) / stats.total_days) * 100 * 100) / 100
      : 0;

    res.json({ stats });
  } catch (error) {
    console.error('Student attendance stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf devam istatistiklerini getir
export const getClassAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { date_from, date_to } = req.query;

    let query = supabase
      .from('student_attendance')
      .select(`
        status,
        attendance_date,
        student_id,
        profiles!student_attendance_student_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('class_id', classId);

    if (date_from) {
      query = query.gte('attendance_date', date_from);
    }
    
    if (date_to) {
      query = query.lte('attendance_date', date_to);
    }

    const { data: attendance, error } = await query;

    if (error) {
      console.error('Error fetching class attendance stats:', error);
      return res.status(500).json({ error: 'Sınıf devam istatistikleri getirilirken hata oluştu' });
    }

    // Öğrenci bazında istatistikleri hesapla
    const studentStats: { [key: string]: any } = {};
    
    attendance.forEach(record => {
      if (!studentStats[record.student_id]) {
        studentStats[record.student_id] = {
          student_info: record.profiles,
          total_days: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      
      studentStats[record.student_id].total_days++;
      studentStats[record.student_id][record.status]++;
    });

    // Her öğrenci için devam oranını hesapla
    const studentResults = Object.values(studentStats).map((student: any) => {
      const attendanceRate = student.total_days > 0 
        ? Math.round(((student.present + student.late + student.excused) / student.total_days) * 100 * 100) / 100
        : 0;
      
      return {
        ...student.student_info,
        ...student,
        attendance_rate: attendanceRate
      };
    });

    // Sınıf genel istatistikleri
    const classStats = {
      total_students: studentResults.length,
      average_attendance_rate: studentResults.length > 0 
        ? Math.round(studentResults.reduce((sum, student) => sum + student.attendance_rate, 0) / studentResults.length * 100) / 100
        : 0,
      total_records: attendance.length
    };

    res.json({ 
      class_stats: classStats,
      student_stats: studentResults
    });
  } catch (error) {
    console.error('Class attendance stats error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Devam durumlarını getir
export const getAttendanceStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = [
      { value: 'present', label: 'Mevcut', color: 'green' },
      { value: 'absent', label: 'Devamsız', color: 'red' },
      { value: 'late', label: 'Geç Geldi', color: 'orange' },
      { value: 'excused', label: 'Mazeret', color: 'blue' }
    ];

    res.json({ statuses });
  } catch (error) {
    console.error('Attendance statuses error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Toplu devam kaydı
export const bulkAddAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { attendance_records } = req.body; // [{ student_id, class_id, lesson_id, attendance_date, status, notes }]

    if (!Array.isArray(attendance_records) || attendance_records.length === 0) {
      return res.status(400).json({ error: 'Geçerli devam kayıtları listesi gerekli' });
    }

    const recordsWithTeacher = attendance_records.map(record => ({
      ...record,
      teacher_id: teacherId,
      created_at: new Date().toISOString()
    }));

    const { data: newRecords, error } = await supabase
      .from('student_attendance')
      .insert(recordsWithTeacher)
      .select(`
        *,
        profiles!student_attendance_student_id_fkey(
          first_name,
          last_name
        )
      `);

    if (error) {
      console.error('Error bulk adding attendance:', error);
      return res.status(500).json({ error: 'Devam kayıtları eklenirken hata oluştu' });
    }

    res.status(201).json({ 
      attendance: newRecords, 
      message: `${newRecords.length} devam kaydı başarıyla eklendi` 
    });
  } catch (error) {
    console.error('Bulk add attendance error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Günlük devam raporu
export const getDailyAttendanceReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { date, class_id } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Tarih gerekli' });
    }

    let query = supabase
      .from('student_attendance')
      .select(`
        *,
        profiles!student_attendance_student_id_fkey(
          first_name,
          last_name,
          email
        ),
        teacher_classes!student_attendance_class_id_fkey(
          class_name
        ),
        teacher_lessons!student_attendance_lesson_id_fkey(
          lesson_title,
          start_time,
          end_time
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('attendance_date', date);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }

    const { data: attendance, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching daily attendance report:', error);
      return res.status(500).json({ error: 'Günlük devam raporu getirilirken hata oluştu' });
    }

    // Özet istatistikler
    const summary = {
      total_students: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    res.json({ 
      date,
      attendance,
      summary
    });
  } catch (error) {
    console.error('Daily attendance report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};