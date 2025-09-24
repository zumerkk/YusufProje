import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';

interface MockPaymentRequest {
  packageId: string;
  amount: number;
  installments: number;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
  };
}

export const mockProcessPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const {
      packageId,
      amount,
      installments,
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      cvv,
      billingAddress
    }: MockPaymentRequest = req.body;

    // Validasyon
    if (!packageId || !amount || !cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv || !billingAddress) {
      return res.status(400).json({ error: 'Eksik bilgiler' });
    }

    // Kart numarası validasyonu (16 haneli)
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Geçersiz kart numarası' });
    }

    // CVV validasyonu (3 haneli)
    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ error: 'Geçersiz CVV' });
    }

    // Email validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingAddress.email)) {
      return res.status(400).json({ error: 'Geçersiz email adresi' });
    }

    // Telefon validasyonu (10-11 haneli)
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(billingAddress.phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Geçersiz telefon numarası' });
    }

    // Paket kontrolü
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !packageData) {
      logger.error('Package not found:', packageError);
      return res.status(404).json({ error: 'Paket bulunamadı' });
    }

    // Mock ödeme işlemi - 2-3 saniye bekleme
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Önce öğrenci paket kaydı oluştur
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 yıl sonra sona erecek

    const studentPackageData = {
      student_id: userId,
      package_id: packageId,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      purchase_date: new Date().toISOString(),
      remaining_lessons: 320, // Örnek: yıllık 40 hafta x 8 ders
      total_lessons: 320
    };

    const { data: studentPackage, error: studentPackageError } = await supabase
      .from('student_packages')
      .insert(studentPackageData)
      .select()
      .single();

    if (studentPackageError) {
      logger.error('Student package creation failed:', studentPackageError);
      return res.status(500).json({ error: 'Paket kaydı oluşturulamadı' });
    }

    // Şimdi ödeme kaydını student_package_id ile birlikte oluştur
    const mockTransactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
      student_id: userId,
      package_id: packageId,
      student_package_id: studentPackage.id,
      amount: amount,
      installments: installments,
      status: 'success',
      payment_method: 'credit_card',
      iyzico_payment_id: mockTransactionId,
      iyzico_conversation_id: `CONV_${Date.now()}`,
      payment_date: new Date().toISOString()
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      logger.error('Payment creation failed:', paymentError);
      // Student package kaydını geri al
      await supabase.from('student_packages').delete().eq('id', studentPackage.id);
      return res.status(500).json({ error: 'Ödeme kaydı oluşturulamadı' });
    }

    logger.info(`Mock payment successful for user ${userId}, package ${packageId}`);

    res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      data: {
        paymentId: payment.id,
        transactionId: mockTransactionId,
        packageName: packageData.name,
        amount: amount,
        installments: installments,
        studentPackageId: studentPackage.id
      }
    });

  } catch (error) {
    logger.error('Mock payment process error:', error);
    res.status(500).json({ error: 'Ödeme işlemi sırasında hata oluştu' });
  }
};