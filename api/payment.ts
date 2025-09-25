/**
 * Consolidated Payment API handler for Vercel
 * Combines initialize, callback, and mock endpoints into a single serverless function
 */
import type { Request, Response } from 'express';
import { supabase } from './config/supabase';
import { authenticateToken } from './middleware/auth';
import Iyzipay from 'iyzipay';

// Set CORS headers helper
const setCorsHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Initialize Iyzico
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

// Payment initialization handler
const handlePaymentInitialize = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { packageId, installmentCount = 1 } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: 'Paket ID gerekli' });
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      console.error('Package fetch error:', packageError);
      return res.status(404).json({ error: 'Paket bulunamadı' });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User fetch error:', userError);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Get student details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (studentError || !student) {
      console.error('Student fetch error:', studentError);
      return res.status(404).json({ error: 'Öğrenci bilgileri bulunamadı' });
    }

    // Create student package record
    const { data: studentPackage, error: studentPackageError } = await supabase
      .from('student_packages')
      .insert({
        student_id: student.id,
        package_id: packageId,
        purchase_date: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending',
        total_amount: packageData.price,
        installment_count: installmentCount
      })
      .select('*')
      .single();

    if (studentPackageError) {
      console.error('Student package creation error:', studentPackageError);
      return res.status(500).json({ error: 'Paket kaydı oluşturulamadı' });
    }

    // Create payment record
    const conversationId = `pkg_${packageId}_${Date.now()}`;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        student_package_id: studentPackage.id,
        amount: packageData.price,
        currency: 'TRY',
        status: 'pending',
        payment_method: 'iyzico',
        conversation_id: conversationId,
        installment_count: installmentCount,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(500).json({ error: 'Ödeme kaydı oluşturulamadı' });
    }

    // Prepare Iyzico payment request
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: packageData.price.toString(),
      paidPrice: packageData.price.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: installmentCount,
      basketId: `basket_${studentPackage.id}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: {
        id: userId,
        name: user.full_name?.split(' ')[0] || 'Ad',
        surname: user.full_name?.split(' ').slice(1).join(' ') || 'Soyad',
        gsmNumber: student.parent_phone || '+905555555555',
        email: user.email,
        identityNumber: '11111111111',
        lastLoginDate: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
        registrationDate: user.created_at?.split('T')[0] + ' ' + (user.created_at?.split('T')[1]?.split('.')[0] || '00:00:00'),
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.ip || '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: user.full_name || 'Ad Soyad',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732'
      },
      billingAddress: {
        contactName: user.full_name || 'Ad Soyad',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732'
      },
      basketItems: [
        {
          id: packageData.id,
          name: packageData.name,
          category1: 'Eğitim',
          category2: packageData.subject || 'Genel',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: packageData.price.toString()
        }
      ]
    };

    // Initialize payment with Iyzico
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        console.error('Iyzico initialization error:', err);
        return res.status(500).json({ error: 'Ödeme başlatılamadı' });
      }

      if (result.status === 'success') {
        res.json({
          success: true,
          checkoutFormContent: result.checkoutFormContent,
          token: result.token,
          paymentPageUrl: result.paymentPageUrl,
          conversationId: conversationId,
          paymentId: payment.id
        });
      } else {
        console.error('Iyzico error:', result.errorMessage);
        res.status(400).json({ error: result.errorMessage || 'Ödeme başlatılamadı' });
      }
    });
  } catch (error) {
    console.error('Payment initialize error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Payment callback handler
const handlePaymentCallback = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token gerekli' });
    }

    // Retrieve payment result from Iyzico
    const request = {
      locale: Iyzipay.LOCALE.TR,
      token: token
    };

    iyzipay.checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err) {
        console.error('Iyzico callback error:', err);
        return res.status(500).json({ error: 'Ödeme doğrulanamadı' });
      }

      try {
        // Find payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('conversation_id', result.conversationId)
          .single();

        if (paymentError || !payment) {
          console.error('Payment not found:', paymentError);
          return res.status(404).json({ error: 'Ödeme kaydı bulunamadı' });
        }

        if (result.status === 'success') {
          // Update payment status
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              iyzico_payment_id: result.paymentId,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          // Update student package status
          await supabase
            .from('student_packages')
            .update({
              status: 'active',
              payment_status: 'completed',
              activation_date: new Date().toISOString()
            })
            .eq('id', payment.student_package_id);

          res.json({
            success: true,
            message: 'Ödeme başarıyla tamamlandı',
            paymentId: payment.id,
            status: 'completed'
          });
        } else {
          // Update payment status as failed
          await supabase
            .from('payments')
            .update({
              status: 'failed',
              error_message: result.errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          // Update student package status
          await supabase
            .from('student_packages')
            .update({
              status: 'cancelled',
              payment_status: 'failed'
            })
            .eq('id', payment.student_package_id);

          res.status(400).json({
            success: false,
            message: result.errorMessage || 'Ödeme başarısız',
            status: 'failed'
          });
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        res.status(500).json({ error: 'Veritabanı güncellenemedi' });
      }
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Mock payment handlers for testing
const handleMockPaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID gerekli' });
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        iyzico_payment_id: `mock_${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('*')
      .single();

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return res.status(500).json({ error: 'Ödeme güncellenemedi' });
    }

    // Update student package status
    await supabase
      .from('student_packages')
      .update({
        status: 'active',
        payment_status: 'completed',
        activation_date: new Date().toISOString()
      })
      .eq('id', payment.student_package_id);

    res.json({
      success: true,
      message: 'Mock ödeme başarıyla tamamlandı',
      paymentId: payment.id,
      status: 'completed'
    });
  } catch (error) {
    console.error('Mock payment success error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const handleMockPaymentFail = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID gerekli' });
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: 'Mock payment failure',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('*')
      .single();

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return res.status(500).json({ error: 'Ödeme güncellenemedi' });
    }

    // Update student package status
    await supabase
      .from('student_packages')
      .update({
        status: 'cancelled',
        payment_status: 'failed'
      })
      .eq('id', payment.student_package_id);

    res.json({
      success: false,
      message: 'Mock ödeme başarısız',
      paymentId: payment.id,
      status: 'failed'
    });
  } catch (error) {
    console.error('Mock payment fail error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Main handler function
export default async function handler(req: Request, res: Response) {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route based on URL path
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    // Payment initialization
    if (path.includes('/initialize') && req.method === 'POST') {
      await handlePaymentInitialize(req, res);
    }
    // Payment callback
    else if (path.includes('/callback') && req.method === 'POST') {
      await handlePaymentCallback(req, res);
    }
    // Mock payment success
    else if (path.includes('/mock/success') && req.method === 'POST') {
      await handleMockPaymentSuccess(req, res);
    }
    // Mock payment failure
    else if (path.includes('/mock/fail') && req.method === 'POST') {
      await handleMockPaymentFail(req, res);
    } else {
      res.status(404).json({ error: 'Payment endpoint not found' });
    }
  } catch (error) {
    console.error('Payment handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}