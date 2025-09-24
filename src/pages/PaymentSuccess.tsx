import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Package, Calendar, CreditCard } from 'lucide-react';

interface LocationState {
  packageName: string;
  amount: number;
  installmentCount: number;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    // Eğer state yoksa ana sayfaya yönlendir
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
          <p className="text-gray-600">Paket satın alımınız başarıyla tamamlandı.</p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Satın Alınan Paket
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paket Adı:</span>
              <span className="font-medium text-gray-900">{state.packageName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Tutar:</span>
              <span className="font-bold text-green-600 text-lg">
                {state.amount.toLocaleString('tr-TR')}₺
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taksit Sayısı:</span>
              <span className="font-medium text-gray-900">{state.installmentCount}x</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aylık Ödeme:</span>
              <span className="font-medium text-blue-600">
                {Math.ceil(state.amount / state.installmentCount).toLocaleString('tr-TR')}₺
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Sonraki Adımlar
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• E-posta adresinize onay mesajı gönderildi</li>
            <li>• Eğitim programınız 24 saat içinde aktif olacak</li>
            <li>• Öğretmeniniz sizinle iletişime geçecek</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Package className="w-5 h-5 mr-2" />
            Paketlerime Git
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Herhangi bir sorunuz mu var?
            <br />
            <a href="mailto:destek@atlas.com" className="text-blue-600 hover:underline">
              destek@atlas.com
            </a>
            {' '} adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;