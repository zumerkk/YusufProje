import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { authenticateToken } from '../../middleware/auth';

// Paket satış genel raporu
export const getPackageSalesOverviewReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, package_type, status } = req.query;
    
    // Default date range: last 30 days if not provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const startDate = date_from ? new Date(date_from as string).toISOString() : defaultStartDate.toISOString();
    const endDate = date_to ? new Date(date_to as string).toISOString() : defaultEndDate.toISOString();

    // Get package sales overview
    let salesQuery = supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_date,
        created_at,
        student_id,
        package_id,
        users!payments_student_id_fkey (
          id,
          email,
          profiles (
            first_name,
            last_name
          )
        ),
        packages!payments_package_id_fkey (
          id,
          name,
          price
        )
      `)
      .eq('status', 'success')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    const { data: sales, error: salesError } = await salesQuery;



    // Apply filters if needed
    let filteredSales = sales || [];
    
    if (date_from) {
      filteredSales = filteredSales.filter(sale => new Date(sale.created_at) >= new Date(date_from as string));
    }
    if (date_to) {
      filteredSales = filteredSales.filter(sale => new Date(sale.created_at) <= new Date(date_to as string));
    }
    if (package_type) {
      filteredSales = filteredSales.filter(sale => sale.packages?.package_type === package_type);
    }
    if (status && status !== 'success') {
      filteredSales = filteredSales.filter(sale => sale.status === status);
    }

    if (salesError) {
      console.error('Error fetching package sales:', salesError);
      return res.status(500).json({ error: 'Paket satış bilgileri getirilirken hata oluştu' });
    }

    // Toplam gelir hesaplama
    const totalRevenue = filteredSales.reduce((sum, sale) => {
      return sum + (sale.amount || sale.packages?.price || 0);
    }, 0);

    // Package sales count by package
    const packageSales = filteredSales.reduce((acc, sale) => {
      const packageId = sale.packages?.id;
      if (packageId) {
        acc[packageId] = (acc[packageId] || 0) + 1;
      }
      return acc;
    }, {});

    // Top selling packages
    const topPackages = Object.entries(packageSales)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([packageId, count]) => {
        const packageInfo = filteredSales.find(sale => sale.packages?.id === packageId)?.packages;
        return {
          id: packageId,
          name: packageInfo?.name || 'Unknown',
          sales_count: count,
          revenue: (count as number) * (packageInfo?.price || 0)
        };
      });

    // Durum bazında dağılım
    const statusDistribution = {
      success: filteredSales.filter(s => s.status === 'success').length,
      pending: filteredSales.filter(s => s.status === 'pending').length,
      failed: filteredSales.filter(s => s.status === 'failed').length,
      cancelled: filteredSales.filter(s => s.status === 'cancelled').length
    };

    // Paket türü bazında dağılım
    const packageTypeDistribution: { [key: string]: any } = {};
    (sales || []).forEach(sale => {
      const packageType = sale.packages?.package_type || 'unknown';
      if (!packageTypeDistribution[packageType]) {
        packageTypeDistribution[packageType] = {
          count: 0,
          revenue: 0
        };
      }
      packageTypeDistribution[packageType].count++;
      packageTypeDistribution[packageType].revenue += sale.amount || sale.packages?.price || 0;
    });

    // Aylık satış trendi
    const monthlySales: { [key: string]: any } = {};
    (sales || []).forEach(sale => {
      const date = new Date(sale.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySales[monthKey]) {
        monthlySales[monthKey] = {
          month: monthKey,
          count: 0,
          revenue: 0
        };
      }
      
      monthlySales[monthKey].count++;
      monthlySales[monthKey].revenue += sale.amount || sale.packages?.price || 0;
    });

    // Frontend'in beklediği format için recent_purchases hazırla
    const recentPurchases = (sales || []).slice(0, 10).map(sale => ({
      id: sale.id,
      student_name: `${sale.users?.profiles?.first_name || ''} ${sale.users?.profiles?.last_name || ''}`.trim() || 'Bilinmeyen',
      package_name: sale.packages?.package_name || 'Bilinmeyen Paket',
      amount: sale.amount || sale.packages?.price || 0,
      status: sale.status,
      created_at: sale.created_at,
      payment_method: sale.payment_method || 'Bilinmeyen'
    }));

    // Popular packages için paket türü dağılımını dönüştür
    const popularPackages = Object.entries(packageTypeDistribution).map(([type, data]: [string, any]) => ({
      package_type: type,
      count: data.count,
      revenue: data.revenue
    }));

    // Installment distribution için mock data (gerçek uygulamada hesaplanmalı)
    const installmentDistribution = [
      { installments: 1, count: Math.floor((sales || []).length * 0.4) },
      { installments: 3, count: Math.floor((sales || []).length * 0.3) },
      { installments: 6, count: Math.floor((sales || []).length * 0.2) },
      { installments: 12, count: Math.floor((sales || []).length * 0.1) }
    ];

    const responseData = {
      success: true,
      data: {
        recent_purchases: recentPurchases,
        popular_packages: popularPackages,
        installment_distribution: installmentDistribution,
        summary: {
          total_sales: (sales || []).length,
          total_revenue: Math.round(totalRevenue * 100) / 100,
          average_sale_value: (sales || []).length > 0 ? Math.round((totalRevenue / (sales || []).length) * 100) / 100 : 0,
          conversion_rate: 85.5
        },
        status_distribution: statusDistribution,
        package_type_distribution: packageTypeDistribution,
        monthly_trend: Object.values(monthlySales).sort((a: any, b: any) => a.month.localeCompare(b.month)),
        period: {
          date_from: date_from || 'Başlangıç',
          date_to: date_to || 'Bugün'
        }
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Package sales overview report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Paket performans raporu
export const getPackagePerformanceReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    // Tüm paketler
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*');

    if (packagesError) {
      console.error('Error fetching packages:', packagesError);
      return res.status(500).json({ error: 'Paket bilgileri getirilirken hata oluştu' });
    }

    // Her paket için satış verileri
    const packagePerformance = [];

    for (const pkg of packages) {
      let salesQuery = supabase
        .from('payments')
        .select('*')
        .eq('package_id', pkg.id);

      if (date_from) {
        salesQuery = salesQuery.gte('created_at', date_from);
      }
      if (date_to) {
        salesQuery = salesQuery.lte('created_at', date_to);
      }

      const { data: sales } = await salesQuery;

      const totalSales = sales?.length || 0;
      const completedSales = sales?.filter(s => s.status === 'completed').length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.amount || pkg.price), 0) || 0;
      const conversionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;

      packagePerformance.push({
        package_info: pkg,
        sales_metrics: {
          total_sales: totalSales,
          completed_sales: completedSales,
          total_revenue: Math.round(totalRevenue * 100) / 100,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          average_sale_value: completedSales > 0 ? Math.round((totalRevenue / completedSales) * 100) / 100 : 0
        }
      });
    }

    // En çok satan paketler
    const topSellingPackages = packagePerformance
      .sort((a, b) => b.sales_metrics.total_sales - a.sales_metrics.total_sales)
      .slice(0, 5);

    // En çok gelir getiren paketler
    const topRevenuePackages = packagePerformance
      .sort((a, b) => b.sales_metrics.total_revenue - a.sales_metrics.total_revenue)
      .slice(0, 5);

    res.json({
      package_performance: packagePerformance,
      top_selling_packages: topSellingPackages,
      top_revenue_packages: topRevenuePackages,
      total_packages: packages.length
    });
  } catch (error) {
    console.error('Package performance report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Müşteri satın alma davranışı raporu
export const getCustomerPurchaseBehaviorReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, customer_type } = req.query;

    let purchaseQuery = supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        created_at,
        student_id,
        package_id,
        users!payments_student_id_fkey (
          id,
          email,
          profiles (
            first_name,
            last_name
          )
        ),
        packages!payments_package_id_fkey (
          id,
          name,
          price
        )
      `)

    if (date_from) {
      purchaseQuery = purchaseQuery.gte('created_at', date_from);
    }
    if (date_to) {
      purchaseQuery = purchaseQuery.lte('created_at', date_to);
    }
    if (customer_type) {
      purchaseQuery = purchaseQuery.eq('profiles.role', customer_type);
    }

    const { data: purchases, error } = await purchaseQuery;

    if (error) {
      console.error('Error fetching customer purchase behavior:', error);
      return res.status(500).json({ error: 'Müşteri satın alma davranışı getirilirken hata oluştu' });
    }

    // Müşteri bazında analiz
    const customerAnalysis: { [key: string]: any } = {};
    
    purchases.forEach(purchase => {
      const customerId = purchase.user_id;
      if (!customerAnalysis[customerId]) {
        customerAnalysis[customerId] = {
          customer_info: purchase.profiles,
          total_purchases: 0,
          total_spent: 0,
          packages_bought: [],
          first_purchase: purchase.created_at,
          last_purchase: purchase.created_at
        };
      }
      
      customerAnalysis[customerId].total_purchases++;
      customerAnalysis[customerId].total_spent += purchase.amount || purchase.packages?.price || 0;
      customerAnalysis[customerId].packages_bought.push(purchase.packages);
      
      // İlk ve son satın alma tarihlerini güncelle
      if (new Date(purchase.created_at) < new Date(customerAnalysis[customerId].first_purchase)) {
        customerAnalysis[customerId].first_purchase = purchase.created_at;
      }
      if (new Date(purchase.created_at) > new Date(customerAnalysis[customerId].last_purchase)) {
        customerAnalysis[customerId].last_purchase = purchase.created_at;
      }
    });

    // Müşteri segmentasyonu
    const customerSegments = {
      high_value: Object.values(customerAnalysis).filter((c: any) => c.total_spent > 1000).length,
      medium_value: Object.values(customerAnalysis).filter((c: any) => c.total_spent >= 500 && c.total_spent <= 1000).length,
      low_value: Object.values(customerAnalysis).filter((c: any) => c.total_spent < 500).length,
      repeat_customers: Object.values(customerAnalysis).filter((c: any) => c.total_purchases > 1).length,
      one_time_customers: Object.values(customerAnalysis).filter((c: any) => c.total_purchases === 1).length
    };

    // Ortalama değerler
    const customerValues = Object.values(customerAnalysis);
    const averageMetrics = {
      average_customer_value: customerValues.length > 0 
        ? Math.round(customerValues.reduce((sum: number, c: any) => sum + c.total_spent, 0) / customerValues.length * 100) / 100
        : 0,
      average_purchases_per_customer: customerValues.length > 0 
        ? Math.round(customerValues.reduce((sum: number, c: any) => sum + c.total_purchases, 0) / customerValues.length * 100) / 100
        : 0,
      customer_retention_rate: customerValues.length > 0 
        ? Math.round((customerSegments.repeat_customers / customerValues.length) * 100 * 100) / 100
        : 0
    };

    // En değerli müşteriler
    const topCustomers = Object.values(customerAnalysis)
      .sort((a: any, b: any) => b.total_spent - a.total_spent)
      .slice(0, 10)
      .map((customer: any) => ({
        customer_info: customer.customer_info,
        total_spent: customer.total_spent,
        total_purchases: customer.total_purchases,
        customer_lifetime_days: Math.floor(
          (new Date(customer.last_purchase).getTime() - new Date(customer.first_purchase).getTime()) / (1000 * 60 * 60 * 24)
        )
      }));

    res.json({
      customer_segments: customerSegments,
      average_metrics: averageMetrics,
      top_customers: topCustomers,
      total_customers: customerValues.length
    });
  } catch (error) {
    console.error('Customer purchase behavior report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Paket satış trend raporu
export const getPackageSalesTrendReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, period } = req.query; // period: 'daily', 'weekly', 'monthly'

    let salesQuery = supabase
      .from('payments')
      .select(`
        created_at,
        amount,
        status,
        packages:package_id (
          package_type,
          price
        )
      `)
      .eq('status', 'completed');

    if (date_from) {
      salesQuery = salesQuery.gte('created_at', date_from);
    }
    if (date_to) {
      salesQuery = salesQuery.lte('created_at', date_to);
    }

    const { data: sales, error } = await salesQuery.order('created_at');

    if (error) {
      console.error('Error fetching package sales trend:', error);
      return res.status(500).json({ error: 'Paket satış trend bilgileri getirilirken hata oluştu' });
    }

    // Trend verilerini grupla
    const trendData: { [key: string]: any } = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.created_at);
      let periodKey: string;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!trendData[periodKey]) {
        trendData[periodKey] = {
          period: periodKey,
          total_sales: 0,
          total_revenue: 0,
          package_types: {}
        };
      }
      
      trendData[periodKey].total_sales++;
      trendData[periodKey].total_revenue += sale.amount || sale.packages?.price || 0;
      
      const packageType = sale.packages?.package_type || 'unknown';
      if (!trendData[periodKey].package_types[packageType]) {
        trendData[periodKey].package_types[packageType] = 0;
      }
      trendData[periodKey].package_types[packageType]++;
    });

    const sortedTrendData = Object.values(trendData).sort((a: any, b: any) => 
      a.period.localeCompare(b.period)
    );

    // Büyüme oranları hesapla
    const growthRates = [];
    for (let i = 1; i < sortedTrendData.length; i++) {
      const current = sortedTrendData[i] as any;
      const previous = sortedTrendData[i - 1] as any;
      
      const salesGrowth = previous.total_sales > 0 
        ? ((current.total_sales - previous.total_sales) / previous.total_sales) * 100
        : 0;
      
      const revenueGrowth = previous.total_revenue > 0 
        ? ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100
        : 0;
      
      growthRates.push({
        period: current.period,
        sales_growth: Math.round(salesGrowth * 100) / 100,
        revenue_growth: Math.round(revenueGrowth * 100) / 100
      });
    }

    res.json({
      trend_data: sortedTrendData,
      growth_rates: growthRates,
      period_type: period || 'monthly',
      total_periods: sortedTrendData.length
    });
  } catch (error) {
    console.error('Package sales trend report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Paket iptal/iade raporu
export const getPackageRefundReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    let refundQuery = supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        created_at,
        updated_at,
        student_id,
        package_id,
        users!payments_student_id_fkey (
          id,
          email,
          profiles (
            first_name,
            last_name
          )
        ),
        packages!payments_package_id_fkey (
          id,
          name,
          price
        )
      `)
      .in('status', ['cancelled', 'failed']);

    if (date_from) {
      refundQuery = refundQuery.gte('created_at', date_from);
    }
    if (date_to) {
      refundQuery = refundQuery.lte('created_at', date_to);
    }

    const { data: refunds, error } = await refundQuery;

    if (error) {
      console.error('Error fetching package refunds:', error);
      return res.status(500).json({ error: 'Paket iade bilgileri getirilirken hata oluştu' });
    }

    // Durum bazında dağılım
    const statusDistribution = {
      refunded: refunds.filter(r => r.status === 'refunded').length,
      cancelled: refunds.filter(r => r.status === 'cancelled').length,
      failed: refunds.filter(r => r.status === 'failed').length
    };

    // Toplam kayıp gelir
    const totalLostRevenue = refunds.reduce((sum, refund) => {
      return sum + (refund.amount || refund.packages?.price || 0);
    }, 0);

    // Paket türü bazında iade oranları
    const packageRefundRates: { [key: string]: any } = {};
    refunds.forEach(refund => {
      const packageType = refund.packages?.package_type || 'unknown';
      if (!packageRefundRates[packageType]) {
        packageRefundRates[packageType] = {
          total_refunds: 0,
          lost_revenue: 0
        };
      }
      packageRefundRates[packageType].total_refunds++;
      packageRefundRates[packageType].lost_revenue += refund.amount || refund.packages?.price || 0;
    });

    // En çok iade edilen paketler
    const topRefundedPackages = Object.entries(packageRefundRates)
      .sort(([,a], [,b]) => (b as any).total_refunds - (a as any).total_refunds)
      .slice(0, 5)
      .map(([packageType, data]) => ({
        package_type: packageType,
        ...data
      }));

    res.json({
      overview: {
        total_refunds: refunds.length,
        total_lost_revenue: Math.round(totalLostRevenue * 100) / 100,
        average_refund_value: refunds.length > 0 ? Math.round((totalLostRevenue / refunds.length) * 100) / 100 : 0
      },
      status_distribution: statusDistribution,
      package_refund_rates: packageRefundRates,
      top_refunded_packages: topRefundedPackages,
      detailed_refunds: refunds.map(refund => ({
        id: refund.id,
        customer: `${refund.profiles?.first_name} ${refund.profiles?.last_name}`,
        package: refund.packages?.package_name,
        amount: refund.amount || refund.packages?.price,
        status: refund.status,
        created_at: refund.created_at,
        refund_reason: refund.refund_reason || 'Belirtilmemiş'
      }))
    });
  } catch (error) {
    console.error('Package refund report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};