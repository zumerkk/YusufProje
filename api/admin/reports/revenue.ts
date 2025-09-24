import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { authenticateToken } from '../../middleware/auth';

// Gelir genel raporu
export const getRevenueOverviewReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, period } = req.query; // period: 'daily', 'weekly', 'monthly', 'yearly'

    // Paket satışlarından gelir
    let packageRevenueQuery = supabase
      .from('payments')
      .select(`
        created_at,
        amount,
        status,
        packages:package_id (
          name,
          price,
          duration_months
        )
      `)
      .eq('status', 'success');

    if (date_from) {
      packageRevenueQuery = packageRevenueQuery.gte('created_at', date_from);
    }
    if (date_to) {
      packageRevenueQuery = packageRevenueQuery.lte('created_at', date_to);
    }

    const { data: packageSales, error: packageError } = await packageRevenueQuery;

    if (packageError) {
      console.error('Error fetching package revenue:', packageError);
      return res.status(500).json({ error: 'Paket gelir bilgileri getirilirken hata oluştu' });
    }

    // Toplam gelir hesaplama
    const totalPackageRevenue = packageSales.reduce((sum, sale) => {
      return sum + (sale.amount / 100 || 0); // Kuruş to TL conversion
    }, 0);

    // Dönemsel gelir analizi
    const revenueByPeriod: { [key: string]: any } = {};
    
    packageSales.forEach(sale => {
      const date = new Date(sale.created_at);
      let periodKey: string;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          periodKey = `W${Math.ceil(date.getDate() / 7)}-${date.getFullYear()}`;
          break;
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        case 'monthly':
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!revenueByPeriod[periodKey]) {
        revenueByPeriod[periodKey] = {
          period: periodKey,
          revenue: 0,
          transactions: 0,
          names: {}
        };
      }
      
      const revenue = sale.amount / 100 || 0; // Kuruş to TL conversion
      revenueByPeriod[periodKey].revenue += revenue;
      revenueByPeriod[periodKey].transactions++;
      
      const packageName = sale.packages?.name || 'unknown';
      if (!revenueByPeriod[periodKey].names[packageName]) {
        revenueByPeriod[periodKey].names[packageName] = 0;
      }
      revenueByPeriod[periodKey].names[packageName] += revenue;
    });

    // Paket türü bazında gelir dağılımı
    const revenueByPackageType: { [key: string]: number } = {};
    packageSales.forEach(sale => {
      const packageName = sale.packages?.name || 'unknown';
      const revenue = sale.amount / 100 || 0; // Kuruş to TL conversion
      revenueByPackageType[packageName] = (revenueByPackageType[packageName] || 0) + revenue;
    });

    // Ortalama işlem değeri
    const averageTransactionValue = packageSales.length > 0 
      ? totalPackageRevenue / packageSales.length 
      : 0;

    // Büyüme oranı hesaplama (önceki dönemle karşılaştırma)
    const sortedPeriods = Object.values(revenueByPeriod).sort((a: any, b: any) => 
      a.period.localeCompare(b.period)
    );
    
    let growthRate = 0;
    if (sortedPeriods.length >= 2) {
      const currentPeriod = sortedPeriods[sortedPeriods.length - 1] as any;
      const previousPeriod = sortedPeriods[sortedPeriods.length - 2] as any;
      
      if (previousPeriod.revenue > 0) {
        growthRate = ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100;
      }
    }

    const report = {
      overview: {
        total_revenue: Math.round(totalPackageRevenue * 100) / 100,
        total_transactions: packageSales.length,
        average_transaction_value: Math.round(averageTransactionValue * 100) / 100,
        growth_rate: Math.round(growthRate * 100) / 100
      },
      revenue_by_period: sortedPeriods,
      revenue_by_name: revenueByPackageType,
      period_type: period || 'monthly',
      date_range: {
        from: date_from || 'Başlangıç',
        to: date_to || 'Bugün'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Revenue overview report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Gelir tahmin raporu
export const getRevenueForecastReport = async (req: Request, res: Response) => {
  try {
    const { forecast_months = 6 } = req.query;

    // Son 12 ayın gelir verilerini al
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: historicalSales, error } = await supabase
      .from('payments')
      .select(`
        created_at,
        amount,
        packages:package_id (
          price
        )
      `)
      .eq('status', 'success')
      .gte('created_at', twelveMonthsAgo.toISOString());

    if (error) {
      console.error('Error fetching historical sales:', error);
      return res.status(500).json({ error: 'Geçmiş satış verileri getirilirken hata oluştu' });
    }

    // Aylık gelir verilerini grupla
    const monthlyRevenue: { [key: string]: number } = {};
    
    historicalSales.forEach(sale => {
      const date = new Date(sale.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const revenue = sale.amount / 100 || 0;
      
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + revenue;
    });

    // Trend analizi için basit doğrusal regresyon
    const months = Object.keys(monthlyRevenue).sort();
    const revenues = months.map(month => monthlyRevenue[month]);
    
    // Ortalama aylık büyüme oranını hesapla
    let totalGrowthRate = 0;
    let growthCount = 0;
    
    for (let i = 1; i < revenues.length; i++) {
      if (revenues[i - 1] > 0) {
        const growthRate = (revenues[i] - revenues[i - 1]) / revenues[i - 1];
        totalGrowthRate += growthRate;
        growthCount++;
      }
    }
    
    const averageGrowthRate = growthCount > 0 ? totalGrowthRate / growthCount : 0;
    const lastMonthRevenue = revenues[revenues.length - 1] || 0;

    // Gelecek aylar için tahmin
    const forecast = [];
    let currentRevenue = lastMonthRevenue;
    
    for (let i = 1; i <= Number(forecast_months); i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Basit büyüme projeksiyonu
      currentRevenue = currentRevenue * (1 + averageGrowthRate);
      
      // Mevsimsellik faktörü (basit)
      const seasonalityFactor = 1 + (Math.sin((futureDate.getMonth() + 1) * Math.PI / 6) * 0.1);
      const adjustedRevenue = currentRevenue * seasonalityFactor;
      
      forecast.push({
        month: monthKey,
        forecasted_revenue: Math.round(adjustedRevenue * 100) / 100,
        confidence_level: Math.max(0.5, 0.9 - (i * 0.05)) // Güven seviyesi zamanla azalır
      });
    }

    // Yıllık tahmin
    const annualForecast = forecast.reduce((sum, month) => sum + month.forecasted_revenue, 0);
    
    // Risk analizi
    const riskFactors = {
      market_volatility: 'Orta', // Mock data
      seasonal_impact: 'Düşük',
      competition_risk: 'Orta',
      economic_factors: 'Düşük'
    };

    res.json({
      historical_data: months.map(month => ({
        month,
        actual_revenue: monthlyRevenue[month]
      })),
      forecast_data: forecast,
      summary: {
        average_monthly_growth: Math.round(averageGrowthRate * 100 * 100) / 100,
        annual_forecast: Math.round(annualForecast * 100) / 100,
        forecast_period_months: Number(forecast_months)
      },
      risk_analysis: riskFactors
    });
  } catch (error) {
    console.error('Revenue forecast report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Gelir karşılaştırma raporu
export const getRevenueComparisonReport = async (req: Request, res: Response) => {
  try {
    const { 
      current_period_start, 
      current_period_end, 
      comparison_period_start, 
      comparison_period_end 
    } = req.query;

    // Mevcut dönem geliri
    const { data: currentPeriodSales, error: currentError } = await supabase
      .from('payments')
      .select(`
        amount,
        created_at,
        packages:package_id (
          name,
          price
        )
      `)
      .eq('status', 'success')
      .gte('created_at', current_period_start)
      .lte('created_at', current_period_end);

    if (currentError) {
      console.error('Error fetching current period sales:', currentError);
      return res.status(500).json({ error: 'Mevcut dönem satış verileri getirilirken hata oluştu' });
    }

    // Karşılaştırma dönemi geliri
    const { data: comparisonPeriodSales, error: comparisonError } = await supabase
      .from('payments')
      .select(`
        amount,
        created_at,
        packages:package_id (
          name,
          price
        )
      `)
      .eq('status', 'success')
      .gte('created_at', comparison_period_start)
      .lte('created_at', comparison_period_end);

    if (comparisonError) {
      console.error('Error fetching comparison period sales:', comparisonError);
      return res.status(500).json({ error: 'Karşılaştırma dönemi satış verileri getirilirken hata oluştu' });
    }

    // Mevcut dönem analizi
    const currentPeriodRevenue = currentPeriodSales.reduce((sum, sale) => {
      return sum + (sale.amount / 100 || 0);
    }, 0);

    const currentPeriodTransactions = currentPeriodSales.length;
    const currentPeriodAvgTransaction = currentPeriodTransactions > 0 
      ? currentPeriodRevenue / currentPeriodTransactions 
      : 0;

    // Karşılaştırma dönemi analizi
    const comparisonPeriodRevenue = comparisonPeriodSales.reduce((sum, sale) => {
      return sum + (sale.amount / 100 || 0);
    }, 0);

    const comparisonPeriodTransactions = comparisonPeriodSales.length;
    const comparisonPeriodAvgTransaction = comparisonPeriodTransactions > 0 
      ? comparisonPeriodRevenue / comparisonPeriodTransactions 
      : 0;

    // Değişim oranları
    const revenueChange = comparisonPeriodRevenue > 0 
      ? ((currentPeriodRevenue - comparisonPeriodRevenue) / comparisonPeriodRevenue) * 100
      : 0;

    const transactionChange = comparisonPeriodTransactions > 0 
      ? ((currentPeriodTransactions - comparisonPeriodTransactions) / comparisonPeriodTransactions) * 100
      : 0;

    const avgTransactionChange = comparisonPeriodAvgTransaction > 0 
      ? ((currentPeriodAvgTransaction - comparisonPeriodAvgTransaction) / comparisonPeriodAvgTransaction) * 100
      : 0;

    // Paket türü bazında karşılaştırma
    const packageNameComparison: { [key: string]: any } = {};
    
    // Mevcut dönem paket türleri
    currentPeriodSales.forEach(sale => {
      const packageName = sale.packages?.name || 'unknown';
      if (!packageNameComparison[packageName]) {
        packageNameComparison[packageName] = {
          current_revenue: 0,
          current_transactions: 0,
          comparison_revenue: 0,
          comparison_transactions: 0
        };
      }
      packageNameComparison[packageName].current_revenue += sale.amount / 100 || 0;
      packageNameComparison[packageName].current_transactions++;
    });

    // Karşılaştırma dönemi paket türleri
    comparisonPeriodSales.forEach(sale => {
      const packageName = sale.packages?.name || 'unknown';
      if (!packageNameComparison[packageName]) {
        packageNameComparison[packageName] = {
          current_revenue: 0,
          current_transactions: 0,
          comparison_revenue: 0,
          comparison_transactions: 0
        };
      }
      packageNameComparison[packageName].comparison_revenue += sale.amount / 100 || 0;
      packageNameComparison[packageName].comparison_transactions++;
    });

    // Her paket türü için değişim oranlarını hesapla
    Object.keys(packageNameComparison).forEach(packageName => {
      const data = packageNameComparison[packageName];
      data.revenue_change = data.comparison_revenue > 0 
        ? ((data.current_revenue - data.comparison_revenue) / data.comparison_revenue) * 100
        : 0;
      data.transaction_change = data.comparison_transactions > 0 
        ? ((data.current_transactions - data.comparison_transactions) / data.comparison_transactions) * 100
        : 0;
    });

    // Günlük gelir trendi
    const dailyTrend = {
      current_period: {},
      comparison_period: {}
    };

    currentPeriodSales.forEach(sale => {
      const day = sale.created_at.split('T')[0];
      const revenue = sale.amount / 100 || 0;
      dailyTrend.current_period[day] = (dailyTrend.current_period[day] || 0) + revenue;
    });

    comparisonPeriodSales.forEach(sale => {
      const day = sale.created_at.split('T')[0];
      const revenue = sale.amount / 100 || 0;
      dailyTrend.comparison_period[day] = (dailyTrend.comparison_period[day] || 0) + revenue;
    });

    res.json({
      period_comparison: {
        current_period: {
          start_date: current_period_start,
          end_date: current_period_end,
          total_revenue: Math.round(currentPeriodRevenue * 100) / 100,
          total_transactions: currentPeriodTransactions,
          average_transaction_value: Math.round(currentPeriodAvgTransaction * 100) / 100
        },
        comparison_period: {
          start_date: comparison_period_start,
          end_date: comparison_period_end,
          total_revenue: Math.round(comparisonPeriodRevenue * 100) / 100,
          total_transactions: comparisonPeriodTransactions,
          average_transaction_value: Math.round(comparisonPeriodAvgTransaction * 100) / 100
        }
      },
      changes: {
        revenue_change: Math.round(revenueChange * 100) / 100,
        transaction_change: Math.round(transactionChange * 100) / 100,
        avg_transaction_change: Math.round(avgTransactionChange * 100) / 100
      },
      name_comparison: packageNameComparison,
      daily_trend: {
        current_period: Object.entries(dailyTrend.current_period)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, revenue]) => ({ date, revenue })),
        comparison_period: Object.entries(dailyTrend.comparison_period)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, revenue]) => ({ date, revenue }))
      }
    });
  } catch (error) {
    console.error('Revenue comparison report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Gelir kaynak analizi raporu
export const getRevenueSourceAnalysisReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;

    // Paket satışları
    let packageQuery = supabase
      .from('payments')
      .select(`
        amount,
        created_at,
        payment_method,
        packages:package_id (
          package_name,
          name,
          price,
          duration_months
        ),
        profiles!payments_user_id_fkey(
          role,
          created_at
        )
      `)
      .eq('status', 'success');

    if (date_from) {
      packageQuery = packageQuery.gte('created_at', date_from);
    }
    if (date_to) {
      packageQuery = packageQuery.lte('created_at', date_to);
    }

    const { data: sales, error } = await packageQuery;

    if (error) {
      console.error('Error fetching revenue source data:', error);
      return res.status(500).json({ error: 'Gelir kaynak verileri getirilirken hata oluştu' });
    }

    // Paket türü bazında gelir
    const revenueByPackageType: { [key: string]: any } = {};
    sales.forEach(sale => {
      const packageName = sale.packages?.name || 'unknown';
      const revenue = sale.amount / 100 || 0;
      
      if (!revenueByPackageType[packageName]) {
        revenueByPackageType[packageName] = {
          revenue: 0,
          transactions: 0,
          packages: new Set()
        };
      }
      
      revenueByPackageType[packageName].revenue += revenue;
      revenueByPackageType[packageName].transactions++;
      revenueByPackageType[packageName].packages.add(sale.packages?.package_name);
    });

    // Set'leri array'e çevir
    Object.keys(revenueByPackageType).forEach(type => {
      revenueByPackageType[type].unique_packages = Array.from(revenueByPackageType[type].packages);
      delete revenueByPackageType[type].packages;
    });

    // Ödeme yöntemi bazında gelir
    const revenueByPaymentMethod: { [key: string]: any } = {};
    sales.forEach(sale => {
      const paymentMethod = sale.payment_method || 'unknown';
      const revenue = sale.amount / 100 || 0;
      
      if (!revenueByPaymentMethod[paymentMethod]) {
        revenueByPaymentMethod[paymentMethod] = {
          revenue: 0,
          transactions: 0
        };
      }
      
      revenueByPaymentMethod[paymentMethod].revenue += revenue;
      revenueByPaymentMethod[paymentMethod].transactions++;
    });

    // Müşteri segmenti bazında gelir
    const revenueByCustomerSegment: { [key: string]: any } = {};
    sales.forEach(sale => {
      // Müşteri yaşına göre segmentasyon
      const customerCreatedAt = new Date(sale.profiles?.created_at);
      const daysSinceRegistration = Math.floor(
        (new Date().getTime() - customerCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let segment = 'unknown';
      if (daysSinceRegistration <= 30) {
        segment = 'new_customer';
      } else if (daysSinceRegistration <= 180) {
        segment = 'regular_customer';
      } else {
        segment = 'loyal_customer';
      }
      
      const revenue = sale.amount / 100 || 0;
      
      if (!revenueByCustomerSegment[segment]) {
        revenueByCustomerSegment[segment] = {
          revenue: 0,
          transactions: 0
        };
      }
      
      revenueByCustomerSegment[segment].revenue += revenue;
      revenueByCustomerSegment[segment].transactions++;
    });

    // Paket süresi bazında gelir
    const revenueByDuration: { [key: string]: any } = {};
    sales.forEach(sale => {
      const duration = sale.packages?.duration_months || 0;
      const durationKey = `${duration}_months`;
      const revenue = sale.amount / 100 || 0;
      
      if (!revenueByDuration[durationKey]) {
        revenueByDuration[durationKey] = {
          revenue: 0,
          transactions: 0
        };
      }
      
      revenueByDuration[durationKey].revenue += revenue;
      revenueByDuration[durationKey].transactions++;
    });

    // Toplam gelir
    const totalRevenue = sales.reduce((sum, sale) => {
      return sum + (sale.amount / 100 || 0);
    }, 0);

    // Yüzdelik dağılımları hesapla
    const addPercentages = (data: { [key: string]: any }) => {
      Object.keys(data).forEach(key => {
        data[key].percentage = totalRevenue > 0 
          ? Math.round((data[key].revenue / totalRevenue) * 100 * 100) / 100
          : 0;
      });
      return data;
    };

    res.json({
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_transactions: sales.length,
      revenue_sources: {
        by_name: addPercentages(revenueByPackageType),
        by_payment_method: addPercentages(revenueByPaymentMethod),
        by_customer_segment: addPercentages(revenueByCustomerSegment),
        by_duration: addPercentages(revenueByDuration)
      },
      top_revenue_sources: {
        top_name: Object.entries(revenueByPackageType)
          .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)[0],
        top_payment_method: Object.entries(revenueByPaymentMethod)
          .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)[0],
        top_customer_segment: Object.entries(revenueByCustomerSegment)
          .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)[0]
      }
    });
  } catch (error) {
    console.error('Revenue source analysis report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Gelir hedef takip raporu
export const getRevenueTargetTrackingReport = async (req: Request, res: Response) => {
  try {
    const { 
      target_amount, 
      target_period_start, 
      target_period_end,
      target_type = 'monthly' // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    } = req.query;

    if (!target_amount || !target_period_start || !target_period_end) {
      return res.status(400).json({ error: 'Hedef tutar ve dönem bilgileri gereklidir' });
    }

    // Hedef dönemdeki gerçek gelir
    const { data: actualSales, error } = await supabase
      .from('payments')
      .select(`
        amount,
        created_at,
        packages:package_id (
          price
        )
      `)
      .eq('status', 'success')
      .gte('created_at', target_period_start)
      .lte('created_at', target_period_end);

    if (error) {
      console.error('Error fetching actual sales for target tracking:', error);
      return res.status(500).json({ error: 'Gerçek satış verileri getirilirken hata oluştu' });
    }

    const actualRevenue = actualSales.reduce((sum, sale) => {
      return sum + (sale.amount / 100 || 0);
    }, 0);

    const targetAmount = Number(target_amount);
    const achievementPercentage = targetAmount > 0 ? (actualRevenue / targetAmount) * 100 : 0;
    const remainingAmount = Math.max(0, targetAmount - actualRevenue);

    // Günlük gelir trendi
    const dailyRevenue: { [key: string]: number } = {};
    actualSales.forEach(sale => {
      const day = sale.created_at.split('T')[0];
      const revenue = sale.amount / 100 || 0;
      dailyRevenue[day] = (dailyRevenue[day] || 0) + revenue;
    });

    // Hedef döneminin gün sayısı
    const startDate = new Date(target_period_start as string);
    const endDate = new Date(target_period_end as string);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    // Günlük hedef ve gerçekleşme
    const dailyTarget = targetAmount / totalDays;
    const dailyActualAverage = elapsedDays > 0 ? actualRevenue / elapsedDays : 0;
    
    // Hedef tamamlama tahmini
    const projectedRevenue = dailyActualAverage * totalDays;
    const projectedAchievementPercentage = targetAmount > 0 ? (projectedRevenue / targetAmount) * 100 : 0;

    // Kalan günlerde günlük hedef
    const dailyTargetRemaining = remainingDays > 0 ? remainingAmount / remainingDays : 0;

    // Performans durumu
    let performanceStatus = 'on_track';
    if (achievementPercentage < 70) {
      performanceStatus = 'behind';
    } else if (achievementPercentage > 110) {
      performanceStatus = 'ahead';
    }

    // Haftalık breakdown (eğer dönem yeterince uzunsa)
    const weeklyBreakdown = [];
    if (totalDays >= 7) {
      const weeks = Math.ceil(totalDays / 7);
      const weeklyTarget = targetAmount / weeks;
      
      for (let week = 0; week < weeks; week++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (week * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
        
        const weekSales = actualSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= weekStart && saleDate <= weekEnd;
        });
        
        const weekRevenue = weekSales.reduce((sum, sale) => {
          return sum + (sale.amount / 100 || 0);
        }, 0);
        
        weeklyBreakdown.push({
          week_number: week + 1,
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          target: Math.round(weeklyTarget * 100) / 100,
          actual: Math.round(weekRevenue * 100) / 100,
          achievement_percentage: weeklyTarget > 0 ? Math.round((weekRevenue / weeklyTarget) * 100 * 100) / 100 : 0
        });
      }
    }

    res.json({
      target_info: {
        target_amount: targetAmount,
        target_period_start,
        target_period_end,
        target_type,
        total_days: totalDays,
        elapsed_days: elapsedDays,
        remaining_days: remainingDays
      },
      performance: {
        actual_revenue: Math.round(actualRevenue * 100) / 100,
        achievement_percentage: Math.round(achievementPercentage * 100) / 100,
        remaining_amount: Math.round(remainingAmount * 100) / 100,
        performance_status: performanceStatus
      },
      daily_metrics: {
        daily_target: Math.round(dailyTarget * 100) / 100,
        daily_actual_average: Math.round(dailyActualAverage * 100) / 100,
        daily_target_remaining: Math.round(dailyTargetRemaining * 100) / 100
      },
      projections: {
        projected_revenue: Math.round(projectedRevenue * 100) / 100,
        projected_achievement_percentage: Math.round(projectedAchievementPercentage * 100) / 100
      },
      daily_breakdown: Object.entries(dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({
          date,
          revenue: Math.round(revenue * 100) / 100,
          target: Math.round(dailyTarget * 100) / 100,
          cumulative_actual: 0, // Bu hesaplanacak
          cumulative_target: 0  // Bu hesaplanacak
        })),
      weekly_breakdown: weeklyBreakdown
    });
  } catch (error) {
    console.error('Revenue target tracking report error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};