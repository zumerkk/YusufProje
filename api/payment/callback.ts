import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { retrievePaymentResult } from '../config/iyzico';

// Ödeme callback'i (Iyzico'dan gelen yanıt)
export async function paymentCallback(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Iyzico'dan ödeme sonucunu al
    let paymentResult;
    try {
      paymentResult = await retrievePaymentResult(token);
    } catch (iyzError) {
      console.error('Iyzico retrieve error:', iyzError);
      return res.status(500).json({ error: 'Payment verification failed' });
    }

    if (paymentResult.status !== 'success') {
      return res.status(400).json({ 
        error: 'Payment failed',
        details: paymentResult.errorMessage 
      });
    }

    // Token ile payment kaydını bul
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_token', token)
      .single();

    if (findError || !payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Payment durumunu güncelle
    const { data: updatedPayment, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        iyzico_payment_id: paymentResult.paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return res.status(500).json({ error: 'Failed to update payment' });
    }

    // Student package'ı aktif et
    const { error: packageError } = await supabase
      .from('student_packages')
      .update({ status: 'active' })
      .eq('id', payment.student_package_id);

    if (packageError) {
      console.error('Error activating package:', packageError);
    }

    res.json({ 
      success: true, 
      message: 'Callback processed successfully',
      paymentStatus: payment.status
    });

  } catch (error) {
    console.error('Error in paymentCallback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Webhook endpoint (Iyzico'dan otomatik bildirimler için)
export async function paymentWebhook(req: Request, res: Response) {
  try {
    const webhookData = req.body;
    
    console.log('Payment webhook received:', webhookData);
    
    // Gerçek uygulamada burada webhook imzasını doğrulayacağız
    // ve ödeme durumunu güncelleyeceğiz
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Error in paymentWebhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Taksit ödemelerini kontrol et
export async function checkInstallments(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Kullanıcının taksitlerini getir
    const { data: installments, error } = await supabase
      .from('payment_installments')
      .select(`
        *,
        payments!inner (
          student_packages!inner (
            student_id,
            packages (
              name
            )
          )
        )
      `)
      .eq('payments.student_packages.student_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching installments:', error);
      return res.status(500).json({ error: 'Failed to fetch installments' });
    }

    // Vadesi geçmiş taksitleri işaretle
    const now = new Date();
    const overdueInstallments = installments?.filter(inst => 
      inst.status === 'pending' && new Date(inst.due_date) < now
    ) || [];

    if (overdueInstallments.length > 0) {
      const overdueIds = overdueInstallments.map(inst => inst.id);
      await supabase
        .from('payment_installments')
        .update({ status: 'overdue' })
        .in('id', overdueIds);
    }

    res.json({ 
      installments: installments || [],
      overdueCount: overdueInstallments.length
    });

  } catch (error) {
    console.error('Error in checkInstallments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Taksit ödemesi yap
export async function payInstallment(req: Request, res: Response) {
  try {
    const { installmentId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Taksit bilgilerini getir ve kullanıcı kontrolü yap
    const { data: installment, error: installmentError } = await supabase
      .from('payment_installments')
      .select(`
        *,
        payments!inner (
          student_packages!inner (
            student_id
          )
        )
      `)
      .eq('id', installmentId)
      .eq('payments.student_packages.student_id', userId)
      .single();

    if (installmentError || !installment) {
      return res.status(404).json({ error: 'Installment not found' });
    }

    if (installment.status === 'paid') {
      return res.status(400).json({ error: 'Installment already paid' });
    }

    // Demo için direkt ödeme başarılı olarak işaretle
    const { error: updateError } = await supabase
      .from('payment_installments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString()
      })
      .eq('id', installmentId);

    if (updateError) {
      console.error('Error updating installment:', updateError);
      return res.status(500).json({ error: 'Failed to update installment' });
    }

    res.json({ 
      success: true, 
      message: 'Installment paid successfully'
    });

  } catch (error) {
    console.error('Error in payInstallment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}