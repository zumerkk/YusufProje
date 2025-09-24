import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { authenticateToken } from '../../middleware/auth';

// Kullanıcı genel raporu
export const getUsersOverviewReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, role, status } = req.query;

    // Toplam kullanıcı sayısı
    let userQuery = supabase
      .from('profiles')
      .select('id, role, created_at, last_sign_in_at, is_active');

    if (role) {
      userQuery = userQuery.eq('role', role);
    }
    if (status === 'active') {
      userQuery = userQuery.eq('is_active', true);
    } else if (status === 'inactive') {
      userQuery = userQuery.eq('is_active', false);
    }
    if (date_from) {
      userQuery = userQuery.gte('created_at', date_from);
    }
    if (date_to) {
      userQuery = userQuery.lte('created_at', date_to);
    }

    const { data: users, error: usersError } = await userQuery;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ error: 'Kullanıcı bilgileri getirilirken hata oluştu' });
    }

    // Rol bazında dağılım
    const roleDistribution = {
      admin: users.filter(u => u.role === 'admin').length,
      teacher: users.filter(u => u.role === 'teacher').length,
      student: users.filter(u => u.role === 'student').length,
      parent: users.filter(u => u.role === 'parent').length
    };

    // Durum bazında dağılım
    const statusDistribution = {
      active: users.filter(u => u.is_active === true).length,
      inactive: users.filter(u => u.is_active === false).length
    };

    // Son 30 gün içinde kayıt olan kullanıcılar
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length;

    // Son 7 gün içinde giriş yapan kullanıcılar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= sevenDaysAgo).length;

    const report = {
      overview: {
        total_users: users.length,
        recent_registrations: recentUsers,
        active_users_week: activeUsers,
        growth_rate: users.length > 0 ? Math.round((recentUsers / users.length) * 100 * 100) / 100 : 0
      },
      role_distribution: roleDistribution,
      status_distribution: statusDistribution,
      period: {
        date_from: date_from || 'Başlangıç',
        date_to: date_to || 'Bugün'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Users overview report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı aktivite raporu
export const getUserActivityReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, user_id } = req.query;

    // Kullanıcı giriş logları (bu tablo mevcut değilse mock data kullanacağız)
    let activityQuery = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        last_sign_in_at,
        created_at,
        is_active
      `);

    if (user_id) {
      activityQuery = activityQuery.eq('id', user_id);
    }
    if (date_from) {
      activityQuery = activityQuery.gte('last_sign_in_at', date_from);
    }
    if (date_to) {
      activityQuery = activityQuery.lte('last_sign_in_at', date_to);
    }

    const { data: users, error } = await activityQuery.order('last_sign_in_at', { ascending: false });

    if (error) {
      console.error('Error fetching user activity:', error);
      return res.status(500).json({ error: 'Kullanıcı aktivite bilgileri getirilirken hata oluştu' });
    }

    // Aktivite istatistikleri
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activityStats = {
      last_24_hours: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneDayAgo).length,
      last_week: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length,
      last_month: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneMonthAgo).length,
      never_logged_in: users.filter(u => !u.last_sign_in_at).length
    };

    // Rol bazında aktivite
    const roleActivity = {
      admin: users.filter(u => u.role === 'admin' && u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length,
      teacher: users.filter(u => u.role === 'teacher' && u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length,
      student: users.filter(u => u.role === 'student' && u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length,
      parent: users.filter(u => u.role === 'parent' && u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length
    };

    res.json({
      activity_statistics: activityStats,
      role_activity: roleActivity,
      user_details: users.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        last_sign_in: user.last_sign_in_at,
        account_age_days: Math.floor((now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        is_active: user.is_active
      }))
    });
  } catch (error) {
    console.error('User activity report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı kayıt trend raporu
export const getUserRegistrationTrendReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, role } = req.query;

    let userQuery = supabase
      .from('profiles')
      .select('created_at, role')
      .order('created_at');

    if (role) {
      userQuery = userQuery.eq('role', role);
    }
    if (date_from) {
      userQuery = userQuery.gte('created_at', date_from);
    }
    if (date_to) {
      userQuery = userQuery.lte('created_at', date_to);
    }

    const { data: users, error } = await userQuery;

    if (error) {
      console.error('Error fetching user registration trend:', error);
      return res.status(500).json({ error: 'Kullanıcı kayıt trend bilgileri getirilirken hata oluştu' });
    }

    // Günlük kayıt sayıları
    const dailyRegistrations: { [key: string]: any } = {};
    
    users.forEach(user => {
      const date = user.created_at.split('T')[0]; // YYYY-MM-DD formatı
      if (!dailyRegistrations[date]) {
        dailyRegistrations[date] = {
          date,
          total: 0,
          admin: 0,
          teacher: 0,
          student: 0,
          parent: 0
        };
      }
      
      dailyRegistrations[date].total++;
      dailyRegistrations[date][user.role]++;
    });

    const trendData = Object.values(dailyRegistrations);

    // Haftalık ve aylık özetler
    const weeklyData: { [key: string]: number } = {};
    const monthlyData: { [key: string]: number } = {};

    users.forEach(user => {
      const date = new Date(user.created_at);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    res.json({
      daily_trend: trendData,
      weekly_summary: Object.entries(weeklyData).map(([week, count]) => ({ week, count })),
      monthly_summary: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
      total_registrations: users.length
    });
  } catch (error) {
    console.error('User registration trend report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı detay raporu
export const getUserDetailReport = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Kullanıcı temel bilgileri
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      return res.status(500).json({ error: 'Kullanıcı bilgileri getirilirken hata oluştu' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    let additionalData = {};

    // Rol bazında ek bilgiler
    if (user.role === 'teacher') {
      // Öğretmen sınıfları
      const { data: classes } = await supabase
        .from('teacher_classes')
        .select('*')
        .eq('teacher_id', userId);

      // Öğretmen ödevleri
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('teacher_id', userId);

      additionalData = {
        classes: classes || [],
        assignments: assignments || [],
        total_classes: classes?.length || 0,
        total_assignments: assignments?.length || 0
      };
    } else if (user.role === 'student') {
      // Öğrenci sınıfları
      const { data: studentClasses } = await supabase
        .from('class_students')
        .select(`
          *,
          teacher_classes!class_students_class_id_fkey(
            class_name,
            teacher_id
          )
        `)
        .eq('student_id', userId);

      // Öğrenci notları
      const { data: grades } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', userId);

      // Devam kayıtları
      const { data: attendance } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('student_id', userId);

      const totalGradePoints = grades?.reduce((sum, grade) => sum + grade.grade, 0) || 0;
      const totalMaxPoints = grades?.reduce((sum, grade) => sum + grade.max_points, 0) || 0;
      const averageGrade = totalMaxPoints > 0 ? (totalGradePoints / totalMaxPoints) * 100 : 0;

      const presentCount = attendance?.filter(a => ['present', 'late', 'excused'].includes(a.status)).length || 0;
      const attendanceRate = attendance?.length > 0 ? (presentCount / attendance.length) * 100 : 0;

      additionalData = {
        classes: studentClasses || [],
        grades: grades || [],
        attendance: attendance || [],
        academic_performance: {
          average_grade: Math.round(averageGrade * 100) / 100,
          total_assignments: grades?.length || 0,
          attendance_rate: Math.round(attendanceRate * 100) / 100
        }
      };
    }

    // Hesap istatistikleri
    const accountStats = {
      account_age_days: Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      last_activity: user.last_sign_in_at,
      is_active: user.is_active,
      email_verified: user.email_confirmed_at ? true : false
    };

    res.json({
      user_info: user,
      account_statistics: accountStats,
      role_specific_data: additionalData
    });
  } catch (error) {
    console.error('User detail report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı rol dağılım raporu
export const getUserRoleDistributionReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    let userQuery = supabase
      .from('profiles')
      .select('role, created_at, is_active');

    if (date_from) {
      userQuery = userQuery.gte('created_at', date_from);
    }
    if (date_to) {
      userQuery = userQuery.lte('created_at', date_to);
    }

    const { data: users, error } = await userQuery;

    if (error) {
      console.error('Error fetching user role distribution:', error);
      return res.status(500).json({ error: 'Kullanıcı rol dağılım bilgileri getirilirken hata oluştu' });
    }

    // Rol bazında sayılar
    const roleDistribution = {
      admin: users.filter(u => u.role === 'admin').length,
      teacher: users.filter(u => u.role === 'teacher').length,
      student: users.filter(u => u.role === 'student').length,
      parent: users.filter(u => u.role === 'parent').length
    };

    // Aktif kullanıcı sayıları
    const activeDistribution = {
      admin: users.filter(u => u.role === 'admin' && u.is_active).length,
      teacher: users.filter(u => u.role === 'teacher' && u.is_active).length,
      student: users.filter(u => u.role === 'student' && u.is_active).length,
      parent: users.filter(u => u.role === 'parent' && u.is_active).length
    };

    const totalUsers = users.length;
    const totalActive = users.filter(u => u.is_active).length;

    res.json({
      total_users: totalUsers,
      total_active: totalActive,
      role_distribution: roleDistribution,
      active_distribution: activeDistribution,
      percentages: {
        admin: totalUsers > 0 ? Math.round((roleDistribution.admin / totalUsers) * 100) : 0,
        teacher: totalUsers > 0 ? Math.round((roleDistribution.teacher / totalUsers) * 100) : 0,
        student: totalUsers > 0 ? Math.round((roleDistribution.student / totalUsers) * 100) : 0,
        parent: totalUsers > 0 ? Math.round((roleDistribution.parent / totalUsers) * 100) : 0
      }
    });
  } catch (error) {
    console.error('User role distribution report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};