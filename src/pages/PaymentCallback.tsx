import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentResult {
  success: boolean;
  message: string;
  paymentId?: string;
  packageName?: string;
}

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setResult({
          success: false,
          message: 'Ödeme token\'ı bulunamadı'
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/payment/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setResult({
            success: true,
            message: 'Ödemeniz başarıyla tamamlandı!',
            paymentId: data.paymentId,
            packageName: data.packageName
          });
          toast.success('Ödeme başarılı!');
        } else {
          setResult({
            success: false,
            message: data.error || 'Ödeme işlemi başarısız oldu'
          });
          toast.error('Ödeme başarısız!');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setResult({
          success: false,
          message: 'Ödeme işlemi sırasında bir hata oluştu'
        });
        toast.error('Bir hata oluştu!');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (result?.success) {
      navigate('/dashboard?tab=packages');
    } else {
      navigate('/packages');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ödeme İşleniyor
          </h2>
          <p className="text-gray-600">
            Ödemeniz kontrol ediliyor, lütfen bekleyiniz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
        {result?.success ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ödeme Başarılı!
            </h2>
            <p className="text-gray-600 mb-6">
              {result.message}
            </p>
            {result.packageName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Satın Alınan Paket:</strong> {result.packageName}
                </p>
                {result.paymentId && (
                  <p className="text-xs text-green-600 mt-1">
                    Ödeme ID: {result.paymentId}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Paketlerime Git
            </button>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ödeme Başarısız
            </h2>
            <p className="text-gray-600 mb-6">
              {result?.message || 'Ödeme işlemi tamamlanamadı'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;