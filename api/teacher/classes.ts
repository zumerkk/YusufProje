import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Sınıf seviyelerini getir
export const getClassLevels = async (req: Request, res: Response) => {
  try {
    // Mevcut öğrencilerden sınıf seviyelerini al
    const { data: classLevels, error } = await supabase
      .from('students')
      .select('grade_level')
      .not('grade_level', 'is', null);

    if (error) {
      console.error('Error fetching class levels:', error);
      return res.status(500).json({ error: 'Sınıf seviyeleri alınamadı' });
    }

    // Benzersiz sınıf seviyelerini al ve sırala
    const uniqueLevels = [...new Set(classLevels.map(item => item.grade_level))]
      .filter(level => level !== null)
      .sort((a, b) => a - b);

    res.json({ class_levels: uniqueLevels });
  } catch (error) {
    console.error('Get class levels error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Belirli sınıf seviyesindeki şubeleri getir
export const getClassSections = async (req: Request, res: Response) => {
  try {
    const { grade_level } = req.params;

    if (!grade_level) {
      return res.status(400).json({ error: 'Sınıf seviyesi gerekli' });
    }

    const { data: sections, error } = await supabase
      .from('students')
      .select('class_section')
      .eq('grade_level', parseInt(grade_level))
      .not('class_section', 'is', null);

    if (error) {
      console.error('Error fetching class sections:', error);
      return res.status(500).json({ error: 'Şubeler alınamadı' });
    }

    // Benzersiz şubeleri al ve sırala
    const uniqueSections = [...new Set(sections.map(item => item.class_section))]
      .filter(section => section !== null)
      .sort();

    res.json({ class_sections: uniqueSections });
  } catch (error) {
    console.error('Get class sections error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Belirli sınıf ve şubedeki öğrenci sayısını getir
export const getClassStudentCount = async (req: Request, res: Response) => {
  try {
    const { grade_level, class_section } = req.params;

    if (!grade_level || !class_section) {
      return res.status(400).json({ error: 'Sınıf seviyesi ve şube gerekli' });
    }

    const { data: students, error, count } = await supabase
      .from('students')
      .select('user_id', { count: 'exact' })
      .eq('grade_level', parseInt(grade_level))
      .eq('class_section', class_section);

    if (error) {
      console.error('Error fetching student count:', error);
      return res.status(500).json({ error: 'Öğrenci sayısı alınamadı' });
    }

    res.json({ 
      student_count: count || 0,
      class_info: {
        grade_level: parseInt(grade_level),
        class_section: class_section
      }
    });
  } catch (error) {
    console.error('Get student count error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni sınıf oluştur
export const createClass = async (req: Request, res: Response) => {
  try {
    const { grade_level, class_section, teacher_id } = req.body;

    if (!grade_level || !class_section || !teacher_id) {
      return res.status(400).json({ error: 'Sınıf seviyesi, şube ve öğretmen ID gerekli' });
    }

    // Sınıfın zaten var olup olmadığını kontrol et
    const { data: existingClass, error: checkError } = await supabase
      .from('classes')
      .select('id')
      .eq('grade_level', grade_level)
      .eq('class_section', class_section)
      .single();

    if (existingClass) {
      return res.status(409).json({ error: 'Bu sınıf zaten mevcut' });
    }

    // Yeni sınıf oluştur
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

// Öğretmenin sınıflarını getir
export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({ error: 'Öğretmen ID gerekli' });
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching teacher classes:', error);
      return res.status(500).json({ error: 'Sınıflar alınamadı' });
    }

    res.json({ classes });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf güncelle
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { grade_level, class_section } = req.body;

    if (!classId) {
      return res.status(400).json({ error: 'Sınıf ID gerekli' });
    }

    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update({ grade_level, class_section })
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      return res.status(500).json({ error: 'Sınıf güncellenemedi' });
    }

    res.json({ 
      message: 'Sınıf başarıyla güncellendi',
      class: updatedClass 
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf sil
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Sınıf ID gerekli' });
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) {
      console.error('Error deleting class:', error);
      return res.status(500).json({ error: 'Sınıf silinemedi' });
    }

    res.json({ message: 'Sınıf başarıyla silindi' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf detayını getir
export const getClassDetail = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Sınıf ID gerekli' });
    }

    const { data: classDetail, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      console.error('Error fetching class detail:', error);
      return res.status(500).json({ error: 'Sınıf detayı alınamadı' });
    }

    res.json({ class: classDetail });
  } catch (error) {
    console.error('Get class detail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tüm sınıfları getir
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('section', { ascending: true });

    if (error) {
      console.error('Error fetching all classes:', error);
      return res.status(500).json({ error: 'Sınıf bilgileri alınamadı' });
    }

    // Her sınıf için öğrenci sayısını al
    const classesWithStudentCount = await Promise.all(
      classes.map(async (cls) => {
        const { count: studentCount, error: countError } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id);

        if (countError) {
          console.error('Error counting students:', countError);
        }

        return {
          id: cls.id,
          name: cls.name,
          grade_level: cls.grade_level,
          section: cls.section,
          display_name: `${cls.grade_level}/${cls.section}`,
          student_count: studentCount || cls.student_count || 0,
          created_at: cls.created_at
        };
      })
    );

    res.json({ classes: classesWithStudentCount });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};