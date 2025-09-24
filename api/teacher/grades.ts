import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenin verdiği notları getir
export const getTeacherGrades = async (req: Request, res: Response) => {
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

// Yeni not ekle
export const addGrade = async (req: Request, res: Response) => {
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

// Not güncelle
export const updateGrade = async (req: Request, res: Response) => {
  try {
    const { gradeId } = req.params;
    const { grade, max_points, description, feedback } = req.body;

    const { data: updatedGrade, error } = await supabase
      .from('student_grades')
      .update({
        grade,
        max_points,
        description,
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', gradeId)
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
      console.error('Error updating grade:', error);
      return res.status(500).json({ error: 'Not güncellenirken hata oluştu' });
    }

    res.json({ grade: updatedGrade, message: 'Not başarıyla güncellendi' });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Not sil
export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { gradeId } = req.params;

    const { error } = await supabase
      .from('student_grades')
      .delete()
      .eq('id', gradeId);

    if (error) {
      console.error('Error deleting grade:', error);
      return res.status(500).json({ error: 'Not silinirken hata oluştu' });
    }

    res.json({ message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Öğrenci not ortalamasını getir
export const getStudentGradeAverage = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { class_id, subject_id } = req.query;

    let query = supabase
      .from('student_grades')
      .select('grade, max_points, grade_type')
      .eq('student_id', studentId);

    if (class_id) {
      query = query.eq('class_id', class_id);
    }
    
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    const { data: grades, error } = await query;

    if (error) {
      console.error('Error fetching student grades:', error);
      return res.status(500).json({ error: 'Öğrenci notları getirilirken hata oluştu' });
    }

    // Not ortalaması hesapla
    let totalPoints = 0;
    let maxTotalPoints = 0;
    let gradeCount = 0;

    grades.forEach(grade => {
      totalPoints += grade.grade;
      maxTotalPoints += grade.max_points;
      gradeCount++;
    });

    const average = gradeCount > 0 ? (totalPoints / maxTotalPoints) * 100 : 0;
    const letterGrade = calculateLetterGrade(average);

    res.json({ 
      average: Math.round(average * 100) / 100,
      letter_grade: letterGrade,
      total_points: totalPoints,
      max_total_points: maxTotalPoints,
      grade_count: gradeCount
    });
  } catch (error) {
    console.error('Student grade average error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf not ortalamasını getir
export const getClassGradeAverage = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { subject_id } = req.query;

    let query = supabase
      .from('student_grades')
      .select(`
        grade,
        max_points,
        student_id,
        profiles!student_grades_student_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('class_id', classId);

    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    const { data: grades, error } = await query;

    if (error) {
      console.error('Error fetching class grades:', error);
      return res.status(500).json({ error: 'Sınıf notları getirilirken hata oluştu' });
    }

    // Öğrenci bazında ortalama hesapla
    const studentAverages: { [key: string]: any } = {};
    
    grades.forEach(grade => {
      if (!studentAverages[grade.student_id]) {
        studentAverages[grade.student_id] = {
          student_info: grade.profiles,
          total_points: 0,
          max_total_points: 0,
          grade_count: 0
        };
      }
      
      studentAverages[grade.student_id].total_points += grade.grade;
      studentAverages[grade.student_id].max_total_points += grade.max_points;
      studentAverages[grade.student_id].grade_count++;
    });

    // Sınıf ortalaması hesapla
    const studentResults = Object.values(studentAverages).map((student: any) => {
      const average = student.grade_count > 0 ? (student.total_points / student.max_total_points) * 100 : 0;
      return {
        ...student.student_info,
        average: Math.round(average * 100) / 100,
        letter_grade: calculateLetterGrade(average),
        grade_count: student.grade_count
      };
    });

    const classAverage = studentResults.length > 0 
      ? studentResults.reduce((sum, student) => sum + student.average, 0) / studentResults.length
      : 0;

    res.json({ 
      class_average: Math.round(classAverage * 100) / 100,
      student_averages: studentResults,
      student_count: studentResults.length
    });
  } catch (error) {
    console.error('Class grade average error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Not türlerini getir
export const getGradeTypes = async (req: Request, res: Response) => {
  try {
    const gradeTypes = [
      { value: 'assignment', label: 'Ödev' },
      { value: 'quiz', label: 'Quiz' },
      { value: 'exam', label: 'Sınav' },
      { value: 'midterm', label: 'Vize' },
      { value: 'final', label: 'Final' },
      { value: 'project', label: 'Proje' },
      { value: 'participation', label: 'Katılım' },
      { value: 'presentation', label: 'Sunum' }
    ];

    res.json({ grade_types: gradeTypes });
  } catch (error) {
    console.error('Grade types error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Toplu not girişi
export const bulkAddGrades = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { grades } = req.body; // [{ student_id, class_id, subject_id, assignment_id, grade, max_points, grade_type, description, feedback }]

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'Geçerli notlar listesi gerekli' });
    }

    const gradesWithTeacher = grades.map(grade => ({
      ...grade,
      teacher_id: teacherId,
      created_at: new Date().toISOString()
    }));

    const { data: newGrades, error } = await supabase
      .from('student_grades')
      .insert(gradesWithTeacher)
      .select(`
        *,
        profiles!student_grades_student_id_fkey(
          first_name,
          last_name
        )
      `);

    if (error) {
      console.error('Error bulk adding grades:', error);
      return res.status(500).json({ error: 'Notlar eklenirken hata oluştu' });
    }

    res.status(201).json({ 
      grades: newGrades, 
      message: `${newGrades.length} not başarıyla eklendi` 
    });
  } catch (error) {
    console.error('Bulk add grades error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Harf notu hesaplama yardımcı fonksiyonu
function calculateLetterGrade(average: number): string {
  if (average >= 90) return 'AA';
  if (average >= 85) return 'BA';
  if (average >= 80) return 'BB';
  if (average >= 75) return 'CB';
  if (average >= 70) return 'CC';
  if (average >= 65) return 'DC';
  if (average >= 60) return 'DD';
  if (average >= 50) return 'FD';
  return 'FF';
}