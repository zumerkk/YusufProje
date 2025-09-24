import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Package, StudentPackage, Payment, PackageCategory, PackageReview } from '../../shared/types';

// Öğrencinin satın aldığı paketleri getir
export const getStudentPackages = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

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
          subtitle,
          description,
          price,
          original_price,
          duration,
          features,
          is_popular,
          is_premium,
          icon,
          gradient,
          category,
          difficulty_level,
          certificate_provided,
          category_id,
          package_categories (
            id,
            name,
            color,
            icon
          )
        ),
        payments (
          id,
          amount,
          status,
          payment_date
        )
      `)
      .eq('student_id', studentId)
      .order('purchase_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: studentPackages, error } = await query;

    if (error) {
      console.error('Error fetching student packages:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch student packages',
        error: error.message 
      });
    }

    // Toplam sayıyı al
    const { count, error: countError } = await supabase
      .from('student_packages')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId);

    return res.status(200).json({
      success: true,
      data: studentPackages || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + Number(limit)) < (count || 0)
      }
    });

  } catch (error) {
    console.error('Error in getStudentPackages:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Mevcut paketleri getir (satın alma için)
export const getAvailablePackages = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      difficulty_level, 
      min_price, 
      max_price, 
      is_popular, 
      is_premium,
      search,
      limit = 20, 
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    let query = supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('is_active', true)
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filtreleme
    if (category) {
      query = query.eq('category_id', category);
    }
    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }
    if (min_price) {
      query = query.gte('price', Number(min_price));
    }
    if (max_price) {
      query = query.lte('price', Number(max_price));
    }
    if (is_popular !== undefined) {
      query = query.eq('is_popular', is_popular === 'true');
    }
    if (is_premium !== undefined) {
      query = query.eq('is_premium', is_premium === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sıralama
    const ascending = sort_order === 'asc';
    if (sort_by === 'price') {
      query = query.order('price', { ascending });
    } else if (sort_by === 'popularity') {
      query = query.order('is_popular', { ascending: false }).order('created_at', { ascending });
    } else {
      query = query.order(sort_by as string, { ascending });
    }

    const { data: packages, error } = await query;

    if (error) {
      console.error('Error fetching packages:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch packages',
        error: error.message 
      });
    }

    // Toplam sayıyı al
    const { count, error: countError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return res.status(200).json({
      success: true,
      data: packages || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + Number(limit)) < (count || 0)
      }
    });

  } catch (error) {
    console.error('Error in getAvailablePackages:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket detayını getir
export const getPackageDetail = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { studentId } = req.query;

    if (!packageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package ID is required' 
      });
    }

    // Paket detayını getir
    const { data: packageDetail, error } = await supabase
      .from('packages')
      .select(`
        *,
        package_categories (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching package detail:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch package detail',
        error: error.message 
      });
    }

    if (!packageDetail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    // Paket değerlendirmelerini getir
    const { data: reviews, error: reviewsError } = await supabase
      .from('package_reviews')
      .select(`
        *,
        students (
          id,
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .eq('package_id', packageId)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // Ortalama rating hesapla
    const { data: ratingData, error: ratingError } = await supabase
      .from('package_reviews')
      .select('rating')
      .eq('package_id', packageId)
      .eq('is_verified', true);

    let averageRating = 0;
    let totalReviews = 0;
    if (ratingData && ratingData.length > 0) {
      totalReviews = ratingData.length;
      const sum = ratingData.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / totalReviews;
    }

    // Öğrenci bu paketi satın almış mı kontrol et
    let hasPurchased = false;
    if (studentId) {
      const { data: studentPackage, error: studentPackageError } = await supabase
        .from('student_packages')
        .select('id, status')
        .eq('student_id', studentId)
        .eq('package_id', packageId)
        .single();
      
      hasPurchased = !!studentPackage;
    }

    // Paket analitiklerini güncelle (görüntülenme sayısı)
    const today = new Date().toISOString().split('T')[0];
    const { data: analytics, error: analyticsError } = await supabase
      .from('package_analytics')
      .select('*')
      .eq('package_id', packageId)
      .eq('date', today)
      .single();

    if (analytics) {
      await supabase
        .from('package_analytics')
        .update({ views_count: analytics.views_count + 1 })
        .eq('id', analytics.id);
    } else {
      await supabase
        .from('package_analytics')
        .insert({
          package_id: packageId,
          date: today,
          views_count: 1,
          purchases_count: 0,
          revenue: 0,
          refunds_count: 0,
          completion_rate: 0
        });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...packageDetail,
        reviews: reviews || [],
        rating: {
          average: Math.round(averageRating * 10) / 10,
          total: totalReviews
        },
        hasPurchased
      }
    });

  } catch (error) {
    console.error('Error in getPackageDetail:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket satın alma işlemi başlat
export const purchasePackage = async (req: Request, res: Response) => {
  try {
    const { 
      packageId, 
      studentId, 
      installments = 1, 
      discountCode,
      notes 
    } = req.body;

    if (!packageId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package ID and Student ID are required' 
      });
    }

    // Paketi kontrol et
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    // Öğrencinin bu paketi zaten satın alıp almadığını kontrol et
    const { data: existingPurchase, error: existingError } = await supabase
      .from('student_packages')
      .select('*')
      .eq('student_id', studentId)
      .eq('package_id', packageId)
      .in('status', ['active', 'pending'])
      .single();

    if (existingPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package already purchased or pending' 
      });
    }

    // İndirim kontrolü
    let discountAmount = 0;
    let finalAmount = packageData.price;
    
    if (discountCode) {
      const { data: discount, error: discountError } = await supabase
        .from('package_discounts')
        .select('*')
        .eq('package_id', packageId)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single();

      if (discount && (!discount.max_uses || discount.current_uses < discount.max_uses)) {
        if (discount.discount_type === 'percentage') {
          discountAmount = Math.round((packageData.price * discount.discount_value) / 100);
        } else {
          discountAmount = discount.discount_value;
        }
        finalAmount = packageData.price - discountAmount;
        
        // İndirim kullanım sayısını artır
        await supabase
          .from('package_discounts')
          .update({ current_uses: discount.current_uses + 1 })
          .eq('id', discount.id);
      }
    }

    // Paket süresini hesapla
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    // Duration'a göre bitiş tarihi hesapla
    if (packageData.duration.includes('ay')) {
      const months = parseInt(packageData.duration);
      expiryDate.setMonth(expiryDate.getMonth() + months);
    } else if (packageData.duration.includes('yıl')) {
      const years = parseInt(packageData.duration);
      expiryDate.setFullYear(expiryDate.getFullYear() + years);
    } else {
      // Varsayılan olarak 1 ay
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    // Student package kaydı oluştur
    const { data: studentPackage, error: studentPackageError } = await supabase
      .from('student_packages')
      .insert({
        student_id: studentId,
        package_id: packageId,
        purchase_date: startDate.toISOString(),
        start_date: startDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        remaining_lessons: 20, // Demo için sabit değer
        total_lessons: 20,
        lessons_used: 0,
        notes: notes,
        discount_applied: discountAmount,
        original_amount: packageData.price,
        final_amount: finalAmount
      })
      .select()
      .single();

    if (studentPackageError) {
      console.error('Error creating student package:', studentPackageError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create student package',
        error: studentPackageError.message 
      });
    }

    // Payment kaydı oluştur
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        student_id: studentId,
        package_id: packageId,
        student_package_id: studentPackage.id,
        amount: finalAmount,
        installments: installments,
        payment_method: 'mock', // Mock ödeme sistemi
        status: 'completed',
        transaction_id: `mock_${Date.now()}`,
        payment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      // Student package'ı geri al
      await supabase
        .from('student_packages')
        .delete()
        .eq('id', studentPackage.id);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to process payment',
        error: paymentError.message 
      });
    }

    // Paket analitiklerini güncelle
    const today = new Date().toISOString().split('T')[0];
    const { data: analytics, error: analyticsError } = await supabase
      .from('package_analytics')
      .select('*')
      .eq('package_id', packageId)
      .eq('date', today)
      .single();

    if (analytics) {
      await supabase
        .from('package_analytics')
        .update({ 
          purchases_count: analytics.purchases_count + 1,
          revenue: analytics.revenue + finalAmount
        })
        .eq('id', analytics.id);
    } else {
      await supabase
        .from('package_analytics')
        .insert({
          package_id: packageId,
          date: today,
          views_count: 0,
          purchases_count: 1,
          revenue: finalAmount,
          refunds_count: 0,
          completion_rate: 0
        });
    }

    return res.status(200).json({
      success: true,
      message: 'Package purchased successfully',
      data: {
        studentPackage,
        payment,
        discountApplied: discountAmount,
        finalAmount
      }
    });

  } catch (error) {
    console.error('Error in purchasePackage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Öğrenci paketini güncelle
export const updateStudentPackage = async (req: Request, res: Response) => {
  try {
    const { studentPackageId } = req.params;
    const { 
      remaining_lessons, 
      lessons_used, 
      status, 
      notes, 
      last_lesson_date 
    } = req.body;

    if (!studentPackageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student Package ID is required' 
      });
    }

    // Mevcut paketi kontrol et
    const { data: existingPackage, error: existingError } = await supabase
      .from('student_packages')
      .select('*')
      .eq('id', studentPackageId)
      .single();

    if (existingError || !existingPackage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student package not found' 
      });
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (remaining_lessons !== undefined) updateData.remaining_lessons = remaining_lessons;
    if (lessons_used !== undefined) updateData.lessons_used = lessons_used;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (last_lesson_date !== undefined) updateData.last_lesson_date = last_lesson_date;

    // Paketi güncelle
    const { data: updatedPackage, error: updateError } = await supabase
      .from('student_packages')
      .update(updateData)
      .eq('id', studentPackageId)
      .select(`
        *,
        packages (
          id,
          name,
          description,
          price,
          duration
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating student package:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update student package',
        error: updateError.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student package updated successfully',
      data: updatedPackage
    });

  } catch (error) {
    console.error('Error in updateStudentPackage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Öğrenci paketini iptal et
export const cancelStudentPackage = async (req: Request, res: Response) => {
  try {
    const { studentPackageId } = req.params;
    const { reason } = req.body;

    if (!studentPackageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student Package ID is required' 
      });
    }

    // Mevcut paketi kontrol et
    const { data: existingPackage, error: existingError } = await supabase
      .from('student_packages')
      .select('*')
      .eq('id', studentPackageId)
      .single();

    if (existingError || !existingPackage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student package not found' 
      });
    }

    if (existingPackage.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Package is already cancelled' 
      });
    }

    // Paketi iptal et
    const { data: cancelledPackage, error: cancelError } = await supabase
      .from('student_packages')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user',
        updated_at: new Date().toISOString()
      })
      .eq('id', studentPackageId)
      .select(`
        *,
        packages (
          id,
          name,
          description,
          price,
          duration
        )
      `)
      .single();

    if (cancelError) {
      console.error('Error cancelling student package:', cancelError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel student package',
        error: cancelError.message 
      });
    }

    // İlgili ödemeyi de iptal et
    await supabase
      .from('payments')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('student_package_id', studentPackageId);

    return res.status(200).json({
      success: true,
      message: 'Student package cancelled successfully',
      data: cancelledPackage
    });

  } catch (error) {
    console.error('Error in cancelStudentPackage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket kategorilerini getir
export const getPackageCategories = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('package_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching package categories:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch package categories',
        error: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      data: categories || []
    });

  } catch (error) {
    console.error('Error in getPackageCategories:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Paket değerlendirmesi ekle
export const addPackageReview = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { studentId, rating, review_text } = req.body;

    if (!packageId || !studentId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package ID, Student ID and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Öğrencinin bu paketi satın alıp almadığını kontrol et
    const { data: studentPackage, error: packageError } = await supabase
      .from('student_packages')
      .select('*')
      .eq('student_id', studentId)
      .eq('package_id', packageId)
      .eq('status', 'active')
      .single();

    if (packageError || !studentPackage) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must purchase this package to leave a review' 
      });
    }

    // Daha önce değerlendirme yapıp yapmadığını kontrol et
    const { data: existingReview, error: existingError } = await supabase
      .from('package_reviews')
      .select('*')
      .eq('package_id', packageId)
      .eq('student_id', studentId)
      .single();

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this package' 
      });
    }

    // Değerlendirme ekle
    const { data: review, error: reviewError } = await supabase
      .from('package_reviews')
      .insert({
        package_id: packageId,
        student_id: studentId,
        rating: rating,
        review_text: review_text,
        is_verified: true, // Demo için direkt onaylı
        helpful_count: 0
      })
      .select(`
        *,
        students (
          id,
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .single();

    if (reviewError) {
      console.error('Error adding package review:', reviewError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add review',
        error: reviewError.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });

  } catch (error) {
    console.error('Error in addPackageReview:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};