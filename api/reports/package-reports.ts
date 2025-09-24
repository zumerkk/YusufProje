import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// Öğrenci bazında paket raporu
export const getStudentPackageReport = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, status } = req.query;

    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID is required' 
      });
    }

    let query = supabase
      .from('student_packages')
      .select(`
        *,
        packages (
          id,
          name,
          description,
          price,
          duration,
          package_categories (
            name,
            color
          )
        ),
        payments (
          id,
          amount,
          final_amount,
          payment_method,
          status,
          created_at
        )
      `)
      .eq('student_id', studentId);

    // Tarih filtreleri
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: packages, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student package report:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch student package report',
        error: error.message 
      });
    }

    // İstatistikleri hesapla
    const stats = {
      total_packages: packages?.length || 0,
      active_packages: packages?.filter(p => p.status === 'active').length || 0,
      completed_packages: packages?.filter(p => p.status === 'completed').length || 0,
      cancelled_packages: packages?.filter(p => p.status === 'cancelled').length || 0,
      total_spent: packages?.reduce((sum, p) => sum + (p.payments?.[0]?.final_amount || 0), 0) || 0,
      total_lessons_used: packages?.reduce((sum, p) => sum + (p.lessons_used || 0), 0) || 0,
      total_remaining_lessons: packages?.reduce((sum, p) => sum + (p.remaining_lessons || 0), 0) || 0
    };

    return res.status(200).json({
      success: true,
      data: {
        packages: packages || [],
        stats
      }
    });

  } catch (error) {
    console.error('Error in getStudentPackageReport:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket bazında satış raporu
export const getPackageSalesReport = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { startDate, endDate, groupBy = 'month' } = req.query;

    if (!packageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package ID is required' 
      });
    }

    let query = supabase
      .from('student_packages')
      .select(`
        *,
        students (
          id,
          profiles (
            first_name,
            last_name,
            email
          )
        ),
        payments (
          id,
          amount,
          final_amount,
          payment_method,
          status,
          created_at
        )
      `)
      .eq('package_id', packageId);

    // Tarih filtreleri
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: sales, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching package sales report:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch package sales report',
        error: error.message 
      });
    }

    // Paket bilgilerini al
    const { data: packageInfo, error: packageError } = await supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          name,
          color
        )
      `)
      .eq('id', packageId)
      .single();

    if (packageError) {
      console.error('Error fetching package info:', packageError);
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    // İstatistikleri hesapla
    const stats = {
      total_sales: sales?.length || 0,
      active_sales: sales?.filter(s => s.status === 'active').length || 0,
      completed_sales: sales?.filter(s => s.status === 'completed').length || 0,
      cancelled_sales: sales?.filter(s => s.status === 'cancelled').length || 0,
      total_revenue: sales?.reduce((sum, s) => sum + (s.payments?.[0]?.final_amount || 0), 0) || 0,
      average_revenue: sales?.length ? (sales.reduce((sum, s) => sum + (s.payments?.[0]?.final_amount || 0), 0) / sales.length) : 0
    };

    // Zaman bazında gruplama
    const groupedSales = sales?.reduce((acc: any, sale) => {
      const date = new Date(sale.created_at);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        key = weekStart.toISOString().split('T')[0];
      } else { // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          sales_count: 0,
          revenue: 0,
          sales: []
        };
      }
      
      acc[key].sales_count++;
      acc[key].revenue += sale.payments?.[0]?.final_amount || 0;
      acc[key].sales.push(sale);
      
      return acc;
    }, {}) || {};

    return res.status(200).json({
      success: true,
      data: {
        package: packageInfo,
        sales: sales || [],
        stats,
        grouped_sales: Object.values(groupedSales)
      }
    });

  } catch (error) {
    console.error('Error in getPackageSalesReport:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Genel dashboard istatistikleri
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Temel istatistikler
    let packageQuery = supabase.from('student_packages').select('*');
    let paymentQuery = supabase.from('payments').select('*');

    if (startDate) {
      packageQuery = packageQuery.gte('created_at', startDate);
      paymentQuery = paymentQuery.gte('created_at', startDate);
    }
    if (endDate) {
      packageQuery = packageQuery.lte('created_at', endDate);
      paymentQuery = paymentQuery.lte('created_at', endDate);
    }

    const [packagesResult, paymentsResult] = await Promise.all([
      packageQuery,
      paymentQuery
    ]);

    if (packagesResult.error || paymentsResult.error) {
      throw new Error('Failed to fetch dashboard data');
    }

    const packages = packagesResult.data || [];
    const payments = paymentsResult.data || [];

    // En popüler paketler
    const packageSales = packages.reduce((acc: any, pkg) => {
      acc[pkg.package_id] = (acc[pkg.package_id] || 0) + 1;
      return acc;
    }, {});

    const { data: popularPackages, error: popularError } = await supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          name,
          color
        )
      `)
      .in('id', Object.keys(packageSales))
      .limit(5);

    const popularPackagesWithSales = popularPackages?.map(pkg => ({
      ...pkg,
      sales_count: packageSales[pkg.id] || 0
    })).sort((a, b) => b.sales_count - a.sales_count) || [];

    // Aylık gelir trendi
    const monthlyRevenue = payments.reduce((acc: any, payment) => {
      const date = new Date(payment.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: key,
          revenue: 0,
          sales_count: 0
        };
      }
      
      acc[key].revenue += payment.final_amount || payment.amount || 0;
      acc[key].sales_count++;
      
      return acc;
    }, {});

    const totalRevenue = payments.reduce((sum, p) => sum + (p.final_amount || p.amount || 0), 0);
    const totalPackagesSold = packages.length;
    
    const stats = {
      total_packages_sold: totalPackagesSold,
      active_packages: packages.filter(p => p.status === 'active').length,
      completed_packages: packages.filter(p => p.status === 'completed').length,
      cancelled_packages: packages.filter(p => p.status === 'cancelled').length,
      total_revenue: totalRevenue,
      average_package_value: totalPackagesSold > 0 ? totalRevenue / totalPackagesSold : 0,
      successful_payments: payments.filter(p => p.status === 'success').length,
      pending_payments: payments.filter(p => p.status === 'pending').length,
      failed_payments: payments.filter(p => p.status === 'failed').length
    };

    return res.status(200).json({
      success: true,
      data: {
        stats,
        popular_packages: popularPackagesWithSales,
        monthly_revenue: Object.values(monthlyRevenue).sort((a: any, b: any) => a.month.localeCompare(b.month))
      }
    });

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Kategori bazında analiz
export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Kategorileri ve satışlarını al
    const { data: categories, error: categoriesError } = await supabase
      .from('package_categories')
      .select(`
        *,
        packages (
          id,
          name,
          price,
          student_packages (
            id,
            status,
            created_at,
            payments (
              amount,
              status
            )
          )
        )
      `);

    if (categoriesError) {
      console.error('Error fetching category analytics:', categoriesError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch category analytics',
        error: categoriesError.message 
      });
    }

    const analytics = categories?.map(category => {
      const allSales = category.packages?.flatMap(pkg => pkg.student_packages || []) || [];
      
      // Tarih filtresi uygula
      const filteredSales = allSales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        if (startDate && saleDate < new Date(startDate as string)) return false;
        if (endDate && saleDate > new Date(endDate as string)) return false;
        return true;
      });

      const revenue = filteredSales.reduce((sum, sale) => {
        return sum + (sale.payments?.[0]?.final_amount || 0);
      }, 0);

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        total_packages: category.packages?.length || 0,
        total_sales: filteredSales.length,
        active_sales: filteredSales.filter(s => s.status === 'active').length,
        completed_sales: filteredSales.filter(s => s.status === 'completed').length,
        cancelled_sales: filteredSales.filter(s => s.status === 'cancelled').length,
        total_revenue: revenue,
        average_revenue: filteredSales.length ? revenue / filteredSales.length : 0
      };
    }) || [];

    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error in getCategoryAnalytics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};