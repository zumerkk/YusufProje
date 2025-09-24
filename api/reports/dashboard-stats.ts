import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Dashboard istatistiklerini getir
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching dashboard stats', { 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Paralel olarak tüm istatistikleri çek
    const [studentsResult, teachersResult, packagesResult, lessonsResult, paymentsResult] = await Promise.allSettled([
      // Toplam öğrenci sayısı
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      
      // Toplam öğretmen sayısı
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher'),
      
      // Toplam aktif paket sayısı
      supabase
        .from('packages')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Toplam ders sayısı
      supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true }),
      
      // Bu ayki toplam gelir
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('payment_date', new Date().toISOString())
    ]);

    // Sonuçları işle
    const totalStudents = studentsResult.status === 'fulfilled' ? studentsResult.value.count || 0 : 0;
    const totalTeachers = teachersResult.status === 'fulfilled' ? teachersResult.value.count || 0 : 0;
    const totalPackages = packagesResult.status === 'fulfilled' ? packagesResult.value.count || 0 : 0;
    const totalLessons = lessonsResult.status === 'fulfilled' ? lessonsResult.value.count || 0 : 0;
    
    let monthlyRevenue = 0;
    if (paymentsResult.status === 'fulfilled' && paymentsResult.value.data) {
      monthlyRevenue = paymentsResult.value.data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }

    // Son 7 günün öğrenci kayıt istatistikleri
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentStudents, error: recentStudentsError } = await supabase
      .from('users')
      .select('created_at')
      .eq('role', 'student')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Günlük kayıt sayılarını hesapla
    const dailyRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = recentStudents?.filter(student => 
        student.created_at.startsWith(dateStr)
      ).length || 0;
      
      dailyRegistrations.push({
        date: dateStr,
        count
      });
    }

    // Popüler paketleri getir
    const { data: popularPackages, error: popularPackagesError } = await supabase
      .from('packages')
      .select(`
        id,
        name,
        price,
        student_packages!inner(id)
      `)
      .eq('is_active', true)
      .limit(5);

    // Paket satış istatistikleri
    const { data: packageSales, error: packageSalesError } = await supabase
      .from('student_packages')
      .select(`
        package_id,
        packages(name)
      `)
      .eq('status', 'active');

    const packageSalesStats = packageSales?.reduce((acc, sale) => {
      const packageName = sale.packages?.name || 'Unknown';
      acc[packageName] = (acc[packageName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const stats = {
      overview: {
        totalStudents,
        totalTeachers,
        totalPackages,
        totalLessons,
        monthlyRevenue
      },
      charts: {
        dailyRegistrations,
        packageSales: Object.entries(packageSalesStats).map(([name, count]) => ({
          name,
          count
        })).slice(0, 10) // Top 10 paket
      },
      popularPackages: popularPackages?.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        salesCount: pkg.student_packages?.length || 0
      })) || []
    };

    logger.info('Dashboard stats fetched successfully', { 
      totalStudents,
      totalTeachers,
      totalPackages,
      monthlyRevenue
    });

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error in getDashboardStats:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Aylık gelir istatistikleri
export const getMonthlyRevenueStats = async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query;
    
    logger.info('Fetching monthly revenue stats', { months });

    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = Number(months) - 1; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());
      
      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      monthlyData.push({
        month: startDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
        revenue: totalRevenue,
        paymentCount: payments?.length || 0
      });
    }

    return res.status(200).json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    logger.error('Error in getMonthlyRevenueStats:', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};