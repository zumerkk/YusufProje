import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createPaymentForm, preparePaymentData, installmentOptions } from '../config/iyzico';

// Ödeme işlemini başlat (Iyzico entegrasyonu için hazırlık)
export async function initializePayment(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { packageId, installmentCount = 1, cardInfo } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Gerekli alanları kontrol et
    if (!packageId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Paket bilgilerini getir
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Kullanıcı bilgilerini getir
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Öğrencinin aktif paketi var mı kontrol et
    const { data: existingPackage } = await supabase
      .from('student_packages')
      .select('*')
      .eq('student_id', userId)
      .eq('status', 'active')
      .single();

    if (existingPackage) {
      return res.status(400).json({ error: 'You already have an active package' });
    }

    // Iyzico ödeme formu oluştur
    const conversationId = `conv_${userId}_${Date.now()}`;
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`;
    
    const paymentData = preparePaymentData({
      userId,
      packageData,
      userEmail: userData.email || 'test@example.com',
      userPhone: '+905555555555',
      installmentCount,
      callbackUrl,
      conversationId
    });

    let paymentForm;
    try {
      paymentForm = await createPaymentForm(paymentData);
    } catch (iyzError) {
      console.error('Iyzico error:', iyzError);
      return res.status(500).json({ error: 'Payment initialization failed' });
    }

    if (paymentForm.status !== 'success') {
      return res.status(400).json({ 
        error: 'Payment form creation failed',
        details: paymentForm.errorMessage 
      });
    }

    // Student package oluştur
    const purchaseDate = new Date();
    const expiryDate = new Date();
    // Yıllık paket için 12 ay ekle
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const { data: studentPackage, error: studentPackageError } = await supabase
      .from('student_packages')
      .insert({
        student_id: userId,
        package_id: packageId,
        purchase_date: purchaseDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        remaining_lessons: 320, // Yıllık 40 hafta x 8 ders
        total_lessons: 320
      })
      .select()
      .single();

    if (studentPackageError) {
      console.error('Error creating student package:', studentPackageError);
      return res.status(500).json({ error: 'Failed to create package subscription' });
    }

    // Payment kaydı oluştur
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        student_id: userId,
        package_id: packageId,
        student_package_id: studentPackage.id,
        amount: packageData.price, // Kuruş cinsinden
        installments: installmentCount,
        payment_method: 'credit_card',
        payment_date: new Date().toISOString(),
        status: 'pending',
        conversation_id: conversationId,
        payment_token: paymentForm.token
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return res.status(500).json({ error: 'Failed to create payment record' });
    }

    // Taksitli ödeme ise taksit kayıtları oluştur
    if (installmentCount > 1) {
      const installmentAmount = Math.round(packageData.price / installmentCount); // Kuruş cinsinden
      const installments = [];
      
      for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        installments.push({
          payment_id: payment.id,
          installment_number: i,
          amount: installmentAmount,
          due_date: dueDate.toISOString().split('T')[0], // Sadece tarih
          status: i === 1 ? 'paid' : 'pending',
          payment_date: i === 1 ? new Date().toISOString() : null,
          iyzico_installment_id: `demo_inst_${payment.id}_${i}`
        });
      }

      const { error: installmentError } = await supabase
        .from('payment_installments')
        .insert(installments);

      if (installmentError) {
        console.error('Error creating installments:', installmentError);
      }
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        installmentCount: payment.installments,
        paymentMethod: payment.payment_method
      },
      studentPackage: {
        id: studentPackage.id,
        packageName: packageData.name,
        startDate: studentPackage.purchase_date,
        endDate: studentPackage.expiry_date
      },
      paymentPageUrl: paymentForm.paymentPageUrl,
      token: paymentForm.token,
      conversationId,
      message: 'Payment initialized successfully'
    });

  } catch (error) {
    console.error('Error in initializePayment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Ödeme durumunu kontrol et
export async function checkPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        student_packages!inner (
          student_id,
          packages (
            name
          )
        )
      `)
      .eq('id', paymentId)
      .eq('student_packages.student_id', userId)
      .single();

    if (error || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Error in checkPaymentStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}