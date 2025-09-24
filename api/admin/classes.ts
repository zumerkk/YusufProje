import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Sınıfları getir
export const getClasses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, grade_level, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('classes')
      .select(`
        id,
        name,
        grade_level,
        section,
        student_count,
        created_at,
        updated_at,
        class_students (
          id,
          student_id,
          assigned_at,
          status,
          students (
            id,
            grade_level,
            school_name,
            users (
              id,
              email,
              profiles (
                first_name,
                last_name
              )
            )
          )
        )
      `);

    // Arama filtresi
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Sınıf seviyesi filtresi
    if (grade_level && grade_level !== 'all') {
      query = query.eq('grade_level', Number(grade_level));
    }

    // Sıralama
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Sayfalama
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: classes, error, count } = await query;

    if (error) {
      console.error('Get classes error:', error);
      return res.status(500).json({ error: 'Sınıflar getirilemedi' });
    }

    // Toplam sayı için ayrı sorgu
    let countQuery = supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.ilike('name', `%${search}%`);
    }
    if (grade_level && grade_level !== 'all') {
      countQuery = countQuery.eq('grade_level', Number(grade_level));
    }

    const { count: totalCount } = await countQuery;

    res.json({
      classes,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      },
      filters: {
        search,
        grade_level,
        sort_by,
        sort_order
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni sınıf oluştur
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, grade_level, section } = req.body;

    // Validasyon
    if (!name || !grade_level) {
      return res.status(400).json({ error: 'Sınıf adı ve seviye gereklidir' });
    }

    // Aynı isimde sınıf var mı kontrol et
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('name', name)
      .eq('grade_level', grade_level)
      .eq('section', section || '')
      .single();

    if (existingClass) {
      return res.status(400).json({ error: 'Bu isimde bir sınıf zaten mevcut' });
    }

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        name,
        grade_level: Number(grade_level),
        section: section || '',
        student_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create class error:', error);
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

// Sınıf güncelle
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade_level, section } = req.body;

    // Validasyon
    if (!name || !grade_level) {
      return res.status(400).json({ error: 'Sınıf adı ve seviye gereklidir' });
    }

    // Sınıf var mı kontrol et
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingClass) {
      return res.status(404).json({ error: 'Sınıf bulunamadı' });
    }

    // Aynı isimde başka sınıf var mı kontrol et
    const { data: duplicateClass } = await supabase
      .from('classes')
      .select('id')
      .eq('name', name)
      .eq('grade_level', grade_level)
      .eq('section', section || '')
      .neq('id', id)
      .single();

    if (duplicateClass) {
      return res.status(400).json({ error: 'Bu isimde bir sınıf zaten mevcut' });
    }

    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update({
        name,
        grade_level: Number(grade_level),
        section: section || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update class error:', error);
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
    const { id } = req.params;

    // Sınıf var mı kontrol et
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id, student_count')
      .eq('id', id)
      .single();

    if (!existingClass) {
      return res.status(404).json({ error: 'Sınıf bulunamadı' });
    }

    // Sınıfta öğrenci var mı kontrol et
    if (existingClass.student_count > 0) {
      return res.status(400).json({ error: 'Sınıfta öğrenci bulunduğu için silinemez' });
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete class error:', error);
      return res.status(500).json({ error: 'Sınıf silinemedi' });
    }

    res.json({ message: 'Sınıf başarıyla silindi' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Aktif öğrencileri getir (sınıfa atama için)
export const getAvailableStudents = async (req: Request, res: Response) => {
  try {
    const { grade_level, search } = req.query;

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        profiles (
          first_name,
          last_name
        ),
        students (
          id,
          grade_level,
          school_name
        )
      `)
      .eq('role', 'student')
      .eq('is_active', true);

    // Sınıf seviyesi filtresi
    if (grade_level) {
      // grade_level string formatında olduğu için like kullanıyoruz
      query = query.like('students.grade_level', `${grade_level}%`);
    }

    // Arama filtresi
    if (search) {
      query = query.or(`email.ilike.%${search}%,profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%`);
    }

    const { data: students, error } = await query;

    if (error) {
      console.error('Get available students error:', error);
      return res.status(500).json({ error: 'Öğrenciler getirilemedi' });
    }

    res.json({ students });
  } catch (error) {
    console.error('Get available students error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Öğrenciyi sınıfa ata
export const assignStudentToClass = async (req: Request, res: Response) => {
  try {
    const { class_id, student_id, notes } = req.body;
    const admin_id = req.user?.id;

    // Validasyon
    if (!class_id || !student_id) {
      return res.status(400).json({ error: 'Sınıf ve öğrenci seçimi gereklidir' });
    }

    // Sınıf var mı kontrol et
    const { data: classData } = await supabase
      .from('classes')
      .select('id, grade_level')
      .eq('id', class_id)
      .single();

    if (!classData) {
      return res.status(404).json({ error: 'Sınıf bulunamadı' });
    }

    // Öğrenci var mı ve seviye uygun mu kontrol et
    const { data: studentData } = await supabase
      .from('students')
      .select('id, grade_level, users!inner(id, is_active)')
      .eq('users.id', student_id)
      .eq('users.is_active', true)
      .single();

    if (!studentData) {
      return res.status(404).json({ error: 'Aktif öğrenci bulunamadı' });
    }

    // Seviye kontrolü (grade_level string formatında)
    const studentGradeNumber = parseInt(studentData.grade_level.match(/\d+/)?.[0] || '0');
    if (studentGradeNumber !== classData.grade_level) {
      return res.status(400).json({ error: 'Öğrenci seviyesi sınıf seviyesi ile uyumlu değil' });
    }

    // Zaten atanmış mı kontrol et
    const { data: existingAssignment } = await supabase
      .from('class_students')
      .select('id')
      .eq('class_id', class_id)
      .eq('student_id', student_id)
      .eq('status', 'active')
      .single();

    if (existingAssignment) {
      return res.status(400).json({ error: 'Öğrenci zaten bu sınıfa atanmış' });
    }

    // Öğrenciyi sınıfa ata
    const { data: assignment, error } = await supabase
      .from('class_students')
      .insert({
        class_id,
        student_id,
        assigned_by: admin_id,
        notes: notes || '',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Assign student error:', error);
      return res.status(500).json({ error: 'Öğrenci atanamadı' });
    }

    // Sınıf öğrenci sayısını güncelle
    const { error: updateError } = await supabase
      .from('classes')
      .update({ student_count: supabase.sql`student_count + 1` })
      .eq('id', class_id);

    if (updateError) {
      console.error('Update student count error:', updateError);
    }

    res.status(201).json({
      message: 'Öğrenci başarıyla sınıfa atandı',
      assignment
    });
  } catch (error) {
    console.error('Assign student error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Öğrenciyi sınıftan çıkar
export const removeStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { class_id, student_id } = req.params;

    // Atama var mı kontrol et
    const { data: assignment } = await supabase
      .from('class_students')
      .select('id')
      .eq('class_id', class_id)
      .eq('student_id', student_id)
      .eq('status', 'active')
      .single();

    if (!assignment) {
      return res.status(404).json({ error: 'Öğrenci ataması bulunamadı' });
    }

    // Atamanın durumunu pasif yap
    const { error } = await supabase
      .from('class_students')
      .update({ status: 'inactive' })
      .eq('id', assignment.id);

    if (error) {
      console.error('Remove student error:', error);
      return res.status(500).json({ error: 'Öğrenci çıkarılamadı' });
    }

    // Sınıf öğrenci sayısını güncelle
    const { error: updateError } = await supabase
      .from('classes')
      .update({ student_count: supabase.sql`student_count - 1` })
      .eq('id', class_id);

    if (updateError) {
      console.error('Update student count error:', updateError);
    }

    res.json({ message: 'Öğrenci başarıyla sınıftan çıkarıldı' });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Sınıf detaylarını getir
export const getClassDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: classData, error } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        grade_level,
        section,
        student_count,
        created_at,
        updated_at,
        class_students!inner (
          id,
          assigned_at,
          status,
          notes,
          students (
            id,
            grade_level,
            school_name,
            parent_name,
            parent_phone,
            users (
              id,
              email,
              profiles (
                first_name,
                last_name,
                phone,
                avatar_url
              )
            )
          )
        )
      `)
      .eq('id', id)
      .eq('class_students.status', 'active')
      .single();

    if (error) {
      console.error('Get class details error:', error);
      return res.status(500).json({ error: 'Sınıf detayları getirilemedi' });
    }

    if (!classData) {
      return res.status(404).json({ error: 'Sınıf bulunamadı' });
    }

    res.json({ class: classData });
  } catch (error) {
    console.error('Get class details error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};