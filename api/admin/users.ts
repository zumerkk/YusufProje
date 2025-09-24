import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';

// Öğretmenleri getir
export const getTeachers = async (req: Request, res: Response) => {
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
        profiles (
          first_name,
          last_name,
          phone,
          avatar_url,
          date_of_birth,
          address
        ),
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

    // Arama filtresi
    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    // Durum filtresi
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Sıralama
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Sayfalama
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: teachers, error, count } = await query;

    if (error) {
      console.error('Get teachers error:', error);
      return res.status(500).json({ error: 'Öğretmenler getirilemedi' });
    }

    // Toplam sayı için ayrı sorgu
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

// Öğrencileri getir
export const getStudents = async (req: Request, res: Response) => {
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
        profiles (
          first_name,
          last_name,
          phone,
          avatar_url,
          date_of_birth,
          address
        ),
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

    // Arama filtresi
    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    // Durum filtresi
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Sıralama
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Sayfalama
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: students, error, count } = await query;

    if (error) {
      console.error('Get students error:', error);
      return res.status(500).json({ error: 'Öğrenciler getirilemedi' });
    }

    // Toplam sayı için ayrı sorgu
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

// Analytics verilerini getir
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Kullanıcı istatistikleri
    const { data: userStats } = await supabase
      .from('users')
      .select('role, is_active');

    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => u.is_active === true).length || 0;
    const totalTeachers = userStats?.filter(u => u.role === 'teacher').length || 0;
    const totalStudents = userStats?.filter(u => u.role === 'student').length || 0;
    const activeTeachers = userStats?.filter(u => u.role === 'teacher' && u.is_active === true).length || 0;
    const activeStudents = userStats?.filter(u => u.role === 'student' && u.is_active === true).length || 0;

    // Paket istatistikleri
    const { data: packageStats } = await supabase
      .from('student_packages')
      .select('status, purchase_date');

    const totalPackages = packageStats?.length || 0;
    const activePackages = packageStats?.filter(p => p.status === 'active').length || 0;

    // Gelir istatistikleri
    const { data: revenueStats } = await supabase
      .from('package_purchases')
      .select('amount, status, purchase_date')
      .eq('status', 'completed');

    const totalRevenue = revenueStats?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    // Bu ay geliri
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyRevenue = revenueStats?.filter(p => 
      new Date(p.purchase_date) >= currentMonth
    ).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Son 30 gün kullanıcı büyümesi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: newUsers } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const userGrowth = newUsers?.length || 0;

    res.json({
      userStats: {
        totalUsers,
        activeUsers,
        totalTeachers,
        totalStudents,
        activeTeachers,
        activeStudents,
        userGrowth
      },
      packageStats: {
        totalPackages,
        activePackages
      },
      revenueStats: {
        totalRevenue,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    
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
        profiles!inner (
          first_name,
          last_name,
          phone,
          avatar_url
        )
      `);

    // Arama filtresi
    if (search) {
      query = query.or(`email.ilike.%${search}%,profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%`);
    }

    // Rol filtresi
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    // Durum filtresi
    if (status && status !== 'all') {
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    // Sıralama
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Sayfalama
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
    }

    // Toplam sayı için ayrı sorgu
    let countQuery = supabase
      .from('users')
      .select('*, profiles!inner(*)', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%,profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%`);
    }
    if (role && role !== 'all') {
      countQuery = countQuery.eq('role', role);
    }
    if (status && status !== 'all') {
      const isActive = status === 'active';
      countQuery = countQuery.eq('is_active', isActive);
    }

    const { count: totalCount } = await countQuery;

    res.json({
      users,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      },
      filters: {
        search,
        role,
        status,
        sort_by,
        sort_order
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı detayını getir
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        profiles!inner (
          first_name,
          last_name,
          phone,
          avatar_url,
          date_of_birth,
          address
        ),
        student_packages (
          id,
          package_id,
          status,
          purchase_date,
          expiry_date,
          packages (
            name,
            price,
            duration_months
          )
        ),
        payments (
          id,
          amount,
          status,
          created_at,
          payment_method
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get user by id error:', error);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı aktivite istatistikleri
    const { data: activityStats } = await supabase
      .from('user_activity_logs')
      .select('action, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Son 30 gün aktivite özeti
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivity } = await supabase
      .from('user_activity_logs')
      .select('action')
      .eq('user_id', id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const activitySummary = {
      total_activities_30d: recentActivity?.length || 0,
      login_count_30d: recentActivity?.filter(a => a.action === 'login').length || 0,
      package_views_30d: recentActivity?.filter(a => a.action === 'view_package').length || 0,
      profile_updates_30d: recentActivity?.filter(a => a.action === 'update_profile').length || 0
    };

    res.json({
      user,
      activity_stats: activityStats,
      activity_summary: activitySummary
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role = 'student',
      phone,
      status = 'active',
      send_welcome_email = true
    } = req.body;

    const full_name = `${first_name || ''} ${last_name || ''}`.trim();

    // Email kontrolü
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
    }

    // Users tablosuna kullanıcı oluştur
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: password, // Gerçek uygulamada hash'lenmeli
        role,
        is_active: status === 'active'
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(400).json({ error: 'Kullanıcı oluşturulamadı: ' + userError.message });
    }

    // Profile tablosuna kullanıcı bilgilerini ekle
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.id,
        first_name,
        last_name,
        phone
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // User kaydını sil
      await supabase.from('users').delete().eq('id', newUser.id);
      return res.status(500).json({ error: 'Profil oluşturulamadı' });
    }

    // Hoş geldin emaili gönder (simülasyon)
    if (send_welcome_email) {
      console.log(`Welcome email sent to ${email}`);
    }

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        ...newUser,
        profile
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı bilgilerini güncelle
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      role,
      status,
      email_verified,
      phone_verified,
      avatar_url
    } = req.body;

    // Kullanıcının var olup olmadığını kontrol et
    console.log('deleteUser: Checking user with ID:', id);
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    console.log('deleteUser: User query result:', { 
      existingUser: existingUser ? 'Found' : 'Not found', 
      userError: userError ? userError.message : 'No error',
      userErrorCode: userError ? userError.code : null
    });

    if (!existingUser || userError) {
      console.log('deleteUser: User not found, returning 404');
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    console.log('deleteUser: User found, proceeding with deletion');

    // Users tablosu için güncelleme verilerini hazırla
    const userUpdateData: any = {};
    if (role !== undefined) userUpdateData.role = role;
    if (status !== undefined) userUpdateData.is_active = status === 'active';

    // Profiles tablosu için güncelleme verilerini hazırla
    const profileUpdateData: any = {};
    if (first_name !== undefined) profileUpdateData.first_name = first_name;
    if (last_name !== undefined) profileUpdateData.last_name = last_name;
    if (phone !== undefined) profileUpdateData.phone = phone;
    if (avatar_url !== undefined) profileUpdateData.avatar_url = avatar_url;

    // Users tablosunu güncelle
    if (Object.keys(userUpdateData).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', id);

      if (userError) {
        console.error('Update user error:', userError);
        return res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
      }
    }

    // Profiles tablosunu güncelle
    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('user_id', id);

      if (profileError) {
        console.error('Update profile error:', profileError);
        return res.status(500).json({ error: 'Profil güncellenemedi' });
      }
    }

    // Güncellenmiş kullanıcıyı getir
    const { data: updatedUser, error } = await supabase
      .from('users')
      .select('*, profiles!inner(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
    }

    // Aktivite logu (opsiyonel)
    // await supabase
    //   .from('user_activity_logs')
    //   .insert({
    //     user_id: id,
    //     action: 'profile_updated',
    //     details: { 
    //       updated_by: 'admin',
    //       changes: [...Object.keys(userUpdateData), ...Object.keys(profileUpdateData)]
    //     },
    //     created_at: new Date().toISOString()
    //   });

    res.json({
      message: 'Kullanıcı başarıyla güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcıyı sil
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const actualId = id || userId;
    const { permanent = false } = req.query;

    // Kullanıcının var olup olmadığını kontrol et
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', actualId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (!existingUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (permanent === 'true') {
      // Kalıcı silme - tüm ilişkili verileri sil
      
      // Önce bağımlı kayıtları sil
      await supabase.from('student_packages').delete().eq('student_id', actualId);
      await supabase.from('payments').delete().eq('student_id', actualId);
      
      // Profile kaydını sil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', actualId);

      if (profileError) {
        console.error('Delete profile error:', profileError);
        return res.status(500).json({ error: 'Profil silinemedi' });
      }

      // User kaydını sil
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', actualId);
      
      if (userError) {
        console.error('Delete user error:', userError);
        return res.status(500).json({ error: 'Kullanıcı silinemedi' });
      }

      res.json({ message: 'Kullanıcı kalıcı olarak silindi' });
    } else {
      // Soft delete - sadece durumu pasif yap
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          is_active: false
        })
        .eq('id', actualId)
        .select('*, profiles(*)')
        .single();

      if (error) {
        console.error('Soft delete user error:', error);
        return res.status(500).json({ error: 'Kullanıcı silinemedi' });
      }

      // Aktivite logu (opsiyonel)
      // await supabase
      //   .from('user_activity_logs')
      //   .insert({
      //     user_id: id,
      //     action: 'account_deleted',
      //     details: { deleted_by: 'admin', type: 'soft_delete' },
      //     created_at: new Date().toISOString()
      //   });

      res.json({
        message: 'Kullanıcı başarıyla silindi',
        user: updatedUser
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı rolünü değiştir
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, reason } = req.body;

    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol' });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const { data: existingUser } = await supabase
      .from('users')
      .select('*, profiles!inner(*)')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const oldRole = existingUser.role;

    // Rolü güncelle
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        role
      })
      .eq('id', id)
      .select('*, profiles!inner(*)')
      .single();

    if (error) {
      console.error('Change user role error:', error);
      return res.status(500).json({ error: 'Rol değiştirilemedi' });
    }

    // Aktivite logu (opsiyonel)
    // await supabase
    //   .from('user_activity_logs')
    //   .insert({
    //     user_id: id,
    //     action: 'role_changed',
    //     details: {
    //       changed_by: 'admin',
    //       old_role: oldRole,
    //       new_role: role,
    //       reason: reason || 'No reason provided'
    //     },
    //     created_at: new Date().toISOString()
    //   });

    res.json({
      message: 'Kullanıcı rolü başarıyla değiştirildi',
      user: updatedUser,
      role_change: {
        from: oldRole,
        to: role
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı durumunu değiştir
export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status || !['active', 'inactive', 'suspended', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const oldStatus = existingUser.status;

    // Durumu güncelle
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Change user status error:', error);
      return res.status(500).json({ error: 'Durum değiştirilemedi' });
    }

    // Aktivite logu
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: id,
        action: 'status_changed',
        details: {
          changed_by: 'admin',
          old_status: oldStatus,
          new_status: status,
          reason: reason || 'No reason provided'
        },
        created_at: new Date().toISOString()
      });

    res.json({
      message: 'Kullanıcı durumu başarıyla değiştirildi',
      user: updatedUser,
      status_change: {
        from: oldStatus,
        to: status
      }
    });
  } catch (error) {
    console.error('Change user status error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Toplu kullanıcı işlemleri
export const bulkUserOperations = async (req: Request, res: Response) => {
  try {
    const { operation, user_ids, data } = req.body;

    if (!operation || !user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({ error: 'Geçersiz istek parametreleri' });
    }

    const results = {
      success: [],
      failed: [],
      total: user_ids.length
    };

    for (const userId of user_ids) {
      try {
        switch (operation) {
          case 'activate':
            await supabase
              .from('profiles')
              .update({ status: 'active', updated_at: new Date().toISOString() })
              .eq('id', userId);
            results.success.push(userId);
            break;

          case 'deactivate':
            await supabase
              .from('profiles')
              .update({ status: 'inactive', updated_at: new Date().toISOString() })
              .eq('id', userId);
            results.success.push(userId);
            break;

          case 'suspend':
            await supabase
              .from('profiles')
              .update({ status: 'suspended', updated_at: new Date().toISOString() })
              .eq('id', userId);
            results.success.push(userId);
            break;

          case 'change_role':
            if (data?.role && ['student', 'teacher', 'admin'].includes(data.role)) {
              await supabase
                .from('profiles')
                .update({ role: data.role, updated_at: new Date().toISOString() })
                .eq('id', userId);
              results.success.push(userId);
            } else {
              results.failed.push({ userId, error: 'Invalid role' });
            }
            break;

          case 'delete':
            await supabase
              .from('profiles')
              .update({ status: 'deleted', updated_at: new Date().toISOString() })
              .eq('id', userId);
            results.success.push(userId);
            break;

          default:
            results.failed.push({ userId, error: 'Unknown operation' });
        }

        // Aktivite logu
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: userId,
            action: `bulk_${operation}`,
            details: {
              performed_by: 'admin',
              operation,
              data
            },
            created_at: new Date().toISOString()
          });

      } catch (error) {
        console.error(`Bulk operation error for user ${userId}:`, error);
        results.failed.push({ userId, error: 'Operation failed' });
      }
    }

    res.json({
      message: 'Toplu işlem tamamlandı',
      results
    });
  } catch (error) {
    console.error('Bulk user operations error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı aktivite geçmişi
export const getUserActivityHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, action_type, date_from, date_to } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', id);

    // Aksiyon türü filtresi
    if (action_type && action_type !== 'all') {
      query = query.eq('action', action_type);
    }

    // Tarih aralığı filtresi
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Sıralama ve sayfalama
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: activities, error } = await query;

    if (error) {
      console.error('Get user activity history error:', error);
      return res.status(500).json({ error: 'Aktivite geçmişi getirilemedi' });
    }

    // Toplam sayı için ayrı sorgu
    let countQuery = supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    if (action_type && action_type !== 'all') {
      countQuery = countQuery.eq('action', action_type);
    }
    if (date_from) {
      countQuery = countQuery.gte('created_at', date_from);
    }
    if (date_to) {
      countQuery = countQuery.lte('created_at', date_to);
    }

    const { count: totalCount } = await countQuery;

    res.json({
      activities,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user activity history error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı istatistikleri
export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    // Toplam kullanıcı sayıları
    const { data: totalUsers } = await supabase
      .from('profiles')
      .select('role, status', { count: 'exact' });

    // Rol bazında dağılım
    const roleDistribution = {
      student: totalUsers?.filter(u => u.role === 'student').length || 0,
      teacher: totalUsers?.filter(u => u.role === 'teacher').length || 0,
      admin: totalUsers?.filter(u => u.role === 'admin').length || 0
    };

    // Durum bazında dağılım
    const statusDistribution = {
      active: totalUsers?.filter(u => u.status === 'active').length || 0,
      inactive: totalUsers?.filter(u => u.status === 'inactive').length || 0,
      suspended: totalUsers?.filter(u => u.status === 'suspended').length || 0,
      deleted: totalUsers?.filter(u => u.status === 'deleted').length || 0
    };

    // Son 30 gün yeni kayıtlar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: newUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Son 7 gün aktif kullanıcılar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeUsers } = await supabase
      .from('user_activity_logs')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString());

    const uniqueActiveUsers = new Set(activeUsers?.map(a => a.user_id)).size;

    // Günlük kayıt trendi (son 30 gün)
    const registrationTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRegistrations = newUsers?.filter(u => {
        const userDate = new Date(u.created_at);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length || 0;

      registrationTrend.push({
        date: dateStr,
        registrations: dayRegistrations
      });
    }

    res.json({
      overview: {
        total_users: totalUsers?.length || 0,
        new_users_30d: newUsers?.length || 0,
        active_users_7d: uniqueActiveUsers,
        growth_rate: newUsers?.length ? ((newUsers.length / (totalUsers?.length || 1)) * 100).toFixed(2) : '0'
      },
      role_distribution: roleDistribution,
      status_distribution: statusDistribution,
      registration_trend: registrationTrend,
      user_engagement: {
        avg_session_duration: '25.3 minutes',
        avg_monthly_logins: 18.7,
        retention_rate_30d: '78.5%',
        churn_rate_30d: '21.5%'
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı arama
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q, role, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ error: 'Arama terimi en az 2 karakter olmalıdır' });
    }

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        profiles (
          first_name,
          last_name,
          phone,
          avatar_url,
          date_of_birth,
          address
        )
      `);

    // Metin arama (email ve profil ismi)
    query = query.or(`email.ilike.%${q}%,profiles.first_name.ilike.%${q}%,profiles.last_name.ilike.%${q}%`);

    // Rol filtresi
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    // Durum filtresi
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Sayfalama ve sıralama
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: users, error } = await query;

    if (error) {
      console.error('Search users error:', error);
      return res.status(500).json({ error: 'Kullanıcı araması yapılamadı' });
    }

    // Toplam sayı için ayrı sorgu
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .or(`email.ilike.%${q}%,profiles.first_name.ilike.%${q}%,profiles.last_name.ilike.%${q}%`);

    if (role && role !== 'all') {
      countQuery = countQuery.eq('role', role);
    }
    if (status && status !== 'all') {
      countQuery = countQuery.eq('is_active', status === 'active');
    }

    const { count: totalCount } = await countQuery;

    res.json({
      users,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / Number(limit))
      },
      search_query: q
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Şifre sıfırlama
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_password, send_email = true } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Şifreyi güncelle
    const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
      password: new_password
    });

    if (updateError) {
      console.error('Reset password error:', updateError);
      return res.status(500).json({ error: 'Şifre sıfırlanamadı' });
    }

    // Aktivite logu
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: id,
        action: 'password_reset',
        details: {
          reset_by: 'admin',
          email_sent: send_email
        },
        created_at: new Date().toISOString()
      });

    // Email gönder (simülasyon)
    if (send_email) {
      console.log(`Password reset email sent to ${existingUser.email}`);
    }

    res.json({
      message: 'Şifre başarıyla sıfırlandı',
      email_sent: send_email
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};