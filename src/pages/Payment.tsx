import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface PaymentData {
  packageId: string;
  packageName: string;
  price: number;
  installments: number;
  timestamp: string;
}

interface FormData {
  // Kart bilgileri
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  
  // Fatura adresi
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    const savedData = localStorage.getItem('payment_data');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Handle different data formats from different sources
        if (parsedData.package && parsedData.installmentCount) {
          // Format from PackageManagement.tsx
          const converted: PaymentData = {
            packageId: parsedData.package.id,
            packageName: parsedData.package.name,
            price: parsedData.package.price,
            installments: parsedData.installmentCount,
            timestamp: new Date().toISOString()
          };
          setPaymentData(converted);
        } else if (parsedData.packageId && parsedData.packageName) {
          // Format from Packages.tsx
          setPaymentData(parsedData);
        } else {
          console.error('Invalid payment data format:', parsedData);
          navigate('/packages');
        }
      } catch (error) {
        console.error('Error parsing payment data:', error);
        navigate('/packages');
      }
    } else {
      navigate('/packages');
    }
  }, [navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    } else if (field === 'phone') {
      formattedValue = value.replace(/\D/g, '').substring(0, 11);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Kart bilgileri validasyonu
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Geçerli bir kart numarası giriniz (16 haneli)';
    }
    
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Geçerli bir son kullanma tarihi giriniz (AA/YY)';
    }
    
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'Geçerli bir CVV giriniz (3 haneli)';
    }
    
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibi adı gereklidir';
    }
    
    // Fatura adresi validasyonu
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Posta kodu gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm() || !paymentData) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurunuz');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Backend'in beklediği format için veriyi dönüştür
      const [expiryMonth, expiryYear] = formData.expiryDate.split('/');
      
      const response = await fetch('/api/payment/mock-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: paymentData.packageId,
          amount: paymentData.price,
          installments: paymentData.installments,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolderName: formData.cardHolderName,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          cvv: formData.cvv,
          billingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
            email: formData.email
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Ödeme başarılı
        localStorage.removeItem('payment_data');
        toast.success('Ödeme başarıyla tamamlandı!');
        
        // Başarı sayfasına yönlendir
        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              packageName: paymentData.packageName,
              amount: paymentData.price,
              installmentCount: paymentData.installments
            }
          });
        }, 1500);
      } else {
        toast.error(data.error || 'Ödeme işlemi başarısız');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ödeme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/packages')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Paketlere Dön
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">256-bit SSL Güvenlik</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Lock className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Güvenli Ödeme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ödeme Formu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Bilgileri</h1>
                <p className="text-gray-600">Güvenli ödeme için bilgilerinizi giriniz</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Kart Bilgileri */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Kart Bilgileri
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Numarası *
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Son Kullanma Tarihi *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={5}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={3}
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Sahibi Adı *
                      </label>
                      <input
                        type="text"
                        value={formData.cardHolderName}
                        onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                        placeholder="JOHN DOE"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.cardHolderName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.cardHolderName && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fatura Adresi */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Fatura Adresi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Adınız"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Soyadınız"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="ornek@email.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adres *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Tam adresinizi giriniz"
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şehir *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="İstanbul"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posta Kodu *
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="34000"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ödeme Butonu */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Ödeme İşleniyor...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Güvenli Ödeme Yap - {paymentData.price.toLocaleString('tr-TR')}₺
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-10 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{paymentData.packageName}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Paket Fiyatı:</span>
                    <span className="font-medium">{paymentData.price.toLocaleString('tr-TR')}₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taksit Sayısı:</span>
                    <span className="font-medium">{paymentData.installments}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aylık Ödeme:</span>
                    <span className="font-medium text-blue-600">{(paymentData.price / paymentData.installments).toLocaleString('tr-TR')}₺</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Toplam Tutar:</span>
                  <span className="text-blue-600">{paymentData.price.toLocaleString('tr-TR')}₺</span>
                </div>
              </div>
              
              {/* Güvenlik Bilgileri */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  <span>256-bit SSL şifreleme</span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-500" />
                  <span>PCI DSS uyumlu güvenlik</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>Güvenli ödeme garantisi</span>
                </div>
              </div>
              
              {/* Kabul Edilen Kartlar */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Kabul Edilen Kartlar:</p>
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                  <div className="w-10 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                  <div className="w-10 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;