import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenin ödevlerini getir
export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    
    const { data: assignments, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        teacher_classes!teacher_assignments_class_id_fkey(
          id,
          class_name
        ),
        teacher_subjects!teacher_assignments_subject_id_fkey(
          id,
          subject_name
        ),
        student_assignments(count)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teacher assignments:', error);
      return res.status(500).json({ error: 'Ödevler getirilirken hata oluştu' });
    }

    res.json({ assignments });
  } catch (error) {
    console.error('Teacher assignments error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni ödev oluştur
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.teacherId;
    const { 
      class_id, 
      subject_id, 
      title, 
      description, 
      due_date, 
      max_points,
      assignment_type,
      instructions 
    } = req.body;

    const { data: newAssignment, error } = await supabase
      .from('teacher_assignments')
      .insert({
        teacher_id: teacherId,
        class_id,
        subject_id,
        title,
        description,
        due_date,
        max_points: max_points || 100,
        assignment_type: assignment_type || 'homework',
        instructions,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        teacher_classes!teacher_assignments_class_id_fkey(
          class_name
        ),
        teacher_subjects!teacher_assignments_subject_id_fkey(
          subject_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return res.status(500).json({ error: 'Ödev oluşturulurken hata oluştu' });
    }

    res.status(201).json({ assignment: newAssignment, message: 'Ödev başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev güncelle
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { 
      title, 
      description, 
      due_date, 
      max_points,
      assignment_type,
      instructions 
    } = req.body;

    const { data: updatedAssignment, error } = await supabase
      .from('teacher_assignments')
      .update({
        title,
        description,
        due_date,
        max_points,
        assignment_type,
        instructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select(`
        *,
        teacher_classes!teacher_assignments_class_id_fkey(
          class_name
        ),
        teacher_subjects!teacher_assignments_subject_id_fkey(
          subject_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating assignment:', error);
      return res.status(500).json({ error: 'Ödev güncellenirken hata oluştu' });
    }

    res.json({ assignment: updatedAssignment, message: 'Ödev başarıyla güncellendi' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev sil
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const { error } = await supabase
      .from('teacher_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error deleting assignment:', error);
      return res.status(500).json({ error: 'Ödev silinirken hata oluştu' });
    }

    res.json({ message: 'Ödev başarıyla silindi' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev detaylarını getir
export const getAssignmentDetail = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const { data: assignment, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        teacher_classes!teacher_assignments_class_id_fkey(
          id,
          class_name
        ),
        teacher_subjects!teacher_assignments_subject_id_fkey(
          id,
          subject_name
        ),
        student_assignments(
          id,
          student_id,
          submission_text,
          submission_file_url,
          submitted_at,
          grade,
          feedback,
          profiles!student_assignments_student_id_fkey(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', assignmentId)
      .single();

    if (error) {
      console.error('Error fetching assignment detail:', error);
      return res.status(500).json({ error: 'Ödev detayları getirilirken hata oluştu' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Assignment detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev teslimlerini getir
export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const { data: submissions, error } = await supabase
      .from('student_assignments')
      .select(`
        *,
        profiles!student_assignments_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignment submissions:', error);
      return res.status(500).json({ error: 'Ödev teslimleri getirilirken hata oluştu' });
    }

    res.json({ submissions });
  } catch (error) {
    console.error('Assignment submissions error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev notlandır
export const gradeAssignment = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const { data: gradedSubmission, error } = await supabase
      .from('student_assignments')
      .update({
        grade,
        feedback,
        graded_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select(`
        *,
        profiles!student_assignments_student_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error grading assignment:', error);
      return res.status(500).json({ error: 'Ödev notlandırılırken hata oluştu' });
    }

    res.json({ submission: gradedSubmission, message: 'Ödev başarıyla notlandırıldı' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Ödev türlerini getir
export const getAssignmentTypes = async (req: Request, res: Response) => {
  try {
    const assignmentTypes = [
      { value: 'homework', label: 'Ev Ödevi' },
      { value: 'project', label: 'Proje' },
      { value: 'essay', label: 'Kompozisyon' },
      { value: 'research', label: 'Araştırma' },
      { value: 'presentation', label: 'Sunum' },
      { value: 'lab_report', label: 'Laboratuvar Raporu' },
      { value: 'quiz', label: 'Quiz' },
      { value: 'exam', label: 'Sınav' }
    ];

    res.json({ assignment_types: assignmentTypes });
  } catch (error) {
    console.error('Assignment types error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Toplu notlandırma
export const bulkGradeAssignments = async (req: Request, res: Response) => {
  try {
    const { grades } = req.body; // [{ submission_id, grade, feedback }]

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'Geçerli notlar listesi gerekli' });
    }

    const updates = grades.map(({ submission_id, grade, feedback }) => 
      supabase
        .from('student_assignments')
        .update({
          grade,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submission_id)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Bulk grading errors:', errors);
      return res.status(500).json({ error: 'Bazı ödevler notlandırılırken hata oluştu' });
    }

    res.json({ message: `${grades.length} ödev başarıyla notlandırıldı` });
  } catch (error) {
    console.error('Bulk grade assignments error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};