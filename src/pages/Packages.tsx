import React, { useState, useEffect } from 'react';

// CSS Animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes gradient-x {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
    opacity: 0;
  }
  
  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Check, 
  Star, 
  Crown, 
  Users, 
  Clock, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  PlayCircle, 
  MessageSquare, 
  BarChart3,
  Sparkles,
  GraduationCap,
  ChevronRight,
  CreditCard,
  Loader2,
  X,
  Home,
  ArrowLeft,
  ChevronLeft,
  CheckCircle,
  Calendar,
  Rocket,
  Phone,
  Info
} from 'lucide-react';

interface PackageFeature {
  text: string;
  icon: React.ReactNode;
}

interface Package {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  targetAudience: string;
  weeklyLessons: string;
  lessonDetails: string[];
  features: PackageFeature[];
  popular?: boolean;
  premium?: boolean;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  textColor: string;
}

const staticPackages: Package[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Atlas Derslik Okul Destek Paketi',
    subtitle: '5-6-7. Sınıflar',
    price: 29999,
    originalPrice: 45000,
    duration: 'yıllık',
    description: 'Okula ve derslere adaptasyon süreçlerini destekleyen kapsamlı eğitim programı',
    targetAudience: '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
    weeklyLessons: 'Haftada 8 canlı ders',
    lessonDetails: [
      'Matematik: 2 Ders',
      'Fen Bilimleri: 2 Ders', 
      'Türkçe: 2 Ders',
      'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
      'İngilizce: 1 Ders'
    ],
    features: [
      { text: 'Uzman Öğretmenler Eşliğinde İnteraktif Dersler', icon: <GraduationCap className="w-4 h-4" /> },
      { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
      { text: 'Yazılılara Hazırlık Çalışmaları', icon: <BookOpen className="w-4 h-4" /> },
      { text: 'Psikolojik Danışman Desteği', icon: <MessageSquare className="w-4 h-4" /> },
      { text: 'Düzenli Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
      { text: 'Ödev Takip Sistemi', icon: <Target className="w-4 h-4" /> },
      { text: 'Öğrenci Paneli ve İlerleme Takip Sistemi', icon: <TrendingUp className="w-4 h-4" /> },
      { text: 'Ders Kayıtlarına Erişim', icon: <Award className="w-4 h-4" /> },
      { text: 'Sorumluluk Bilinci Geliştirme', icon: <Sparkles className="w-4 h-4" /> },
      { text: 'Akademik Destek Seminerleri', icon: <GraduationCap className="w-4 h-4" /> }
    ],
    popular: false,
    premium: false,
    icon: <BookOpen className="h-8 w-8" />,
    gradient: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
    name: 'Atlas Derslik LGS Destek Paketi',
    subtitle: '8. Sınıf LGS Hazırlık',
    price: 34999,
    originalPrice: 55000,
    duration: 'yıllık', 
    description: 'LGS\'de hedeflenen puanın üstüne çıkmak için motivasyon ve sınav kaygısı yönetimi ile desteklenen tam kapsamlı hazırlık programı',
    targetAudience: '8. sınıf öğrencileri için LGS\'ye özel hazırlanmış yoğun program',
    weeklyLessons: 'Haftada 10 canlı ders',
    lessonDetails: [
      'Matematik: 3 Ders',
      'Fen Bilimleri: 3 Ders',
      'Türkçe: 2 Ders', 
      'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
      'İngilizce: 1 Ders',
      'Din Kültürü ve Ahlak Bilgisi Tekrar Kampı'
    ],
    features: [
      { text: 'Uzman Öğretmenler Eşliğinde İnteraktif Dersler', icon: <GraduationCap className="w-4 h-4" /> },
      { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
      { text: 'Özel Hazırlık Çalışmaları (Yazılı Öncesi)', icon: <Clock className="w-4 h-4" /> },
      { text: 'Psikolojik Danışman Desteği', icon: <MessageSquare className="w-4 h-4" /> },
      { text: 'Düzenli Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
      { text: 'Ödev Takip Sistemi', icon: <Target className="w-4 h-4" /> },
      { text: 'Öğrenci Paneli ve İlerleme Takip Sistemi', icon: <TrendingUp className="w-4 h-4" /> },
      { text: 'Ders Kayıtları ve Gelişim Raporları', icon: <Award className="w-4 h-4" /> },
      { text: 'Motivasyon ve Sınav Kaygısı Yönetimi', icon: <Sparkles className="w-4 h-4" /> },
      { text: 'Bireysel İhtiyaçlara Odaklanma', icon: <PlayCircle className="w-4 h-4" /> },
      { text: 'Akademik Destek Seminerleri', icon: <GraduationCap className="w-4 h-4" /> }
    ],
    popular: true,
    premium: false,
    icon: <Crown className="h-8 w-8" />,
    gradient: 'from-orange-500 to-red-400',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
];


const testimonials = [
  {
    name: 'Zeynep A.',
    grade: '8. Sınıf',
    text: 'LGS Destek Paketi sayesinde matematik notlarım 40\'tan 85\'e çıktı. Canlı dersler çok etkili!',
    rating: 5
  },
  {
    name: 'Mehmet K.',
    grade: '7. Sınıf',
    text: 'Okul Destek Paketi ile tüm derslerimde başarılı oldum. Öğretmenlerimiz gerçekten harika.',
    rating: 5
  },
  {
    name: 'Ayşe D.',
    grade: '8. Sınıf',
    text: 'Deneme analizleri sayesinde eksik konularımı kolayca tespit edip çalışabiliyorum.',
    rating: 5
  }
];

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>(staticPackages);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState(1);

  const installmentOptions = [1, 2, 3, 6, 9, 12];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPackages(data);
        } else {
          setPackages(staticPackages);
        }
      } else {
        // Fallback to static data if API fails
        setPackages(staticPackages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages(staticPackages);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowInstallmentModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error('Lütfen bir paket seçin');
      return;
    }
    
    try {
      setPurchaseLoading(selectedPackage.id);
      
      const paymentData = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        installments: selectedInstallments,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('payment_data', JSON.stringify(paymentData));
      setShowInstallmentModal(false);
      navigate('/payment');
      
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setPurchaseLoading(null);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-3xl translate-x-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-green-200/30 to-cyan-200/30 rounded-full blur-3xl translate-y-1/2 animate-pulse" style={{animationDelay: '4s'}}></div>
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Home Link */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img 
                    src="/logo-icon.png" 
                    alt="Atlas Logo" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                    }}
                  />
                  <Home className="w-5 h-5 text-white hidden" />
                </div>
                <span className="font-bold text-lg">Atlas Derslik</span>
              </Link>
              
              {/* Back Button */}
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Geri</span>
              </button>
            </div>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-blue-600 transition-colors">Anasayfa</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Eğitim Paketleri</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Anasayfa</span>
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100/20 to-purple-100/20 px-6 py-3 rounded-full text-blue-100 font-semibold mb-8 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-5 h-5 mr-2" />
              Premium Eğitim Deneyimi
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Eğitim{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
                Paketlerimiz
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Uzman öğretmenler eşliğinde, kişiye özel eğitim programları ile hedeflerinize ulaşın.
              <span className="block text-yellow-300 font-semibold mt-2">
                ✨ Sınırlı zamanlı özel indirimler!
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Users className="w-4 h-4 mr-2 text-cyan-300" />
                10 Kişilik VIP Gruplar
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Award className="w-4 h-4 mr-2 text-yellow-300" />
                Uzman Öğretmenler
              </div>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Clock className="w-4 h-4 mr-2 text-green-300" />
                Canlı İnteraktif Dersler
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>


      {/* Packages Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full text-blue-700 font-semibold mb-8">
              <BookOpen className="w-5 h-5 mr-2" />
              Eğitim Paketleri
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Size Özel{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Eğitim Paketleri
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              İhtiyaçlarınıza uygun paketi seçin, başarıya giden yolda biz yanınızdayız.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  <Loader2 className="w-8 h-8 animate-spin text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="ml-4 text-lg text-gray-600 font-medium">Paketler yükleniyor...</span>
              </div>
            ) : (
              Array.isArray(packages) && packages.length > 0 ? packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`group relative bg-white rounded-3xl shadow-xl border transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] ${
                  pkg.popular 
                    ? 'border-orange-200 ring-2 ring-orange-100 shadow-orange-100/50' 
                    : 'border-gray-100 hover:border-blue-200'
                } animate-fade-in-up`}
                style={{animationDelay: `${index * 150}ms`}}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span>EN POPÜLER</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-3 rounded-3xl group-hover:opacity-8 transition-opacity duration-500`}></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative p-8 lg:p-10">
                  {/* Package Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${pkg.bgColor} rounded-3xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      <div className={`${pkg.textColor} transform group-hover:rotate-12 transition-transform duration-500`}>
                        {pkg.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{pkg.name}</h3>
                    <div className="text-lg font-semibold text-purple-600 mb-4 bg-gray-50 px-4 py-2 rounded-full inline-block">{pkg.subtitle}</div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{pkg.description}</p>
                    
                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-500">
                        <div className="flex items-center justify-center mb-3">
                          <span className={`text-5xl font-bold bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                            {pkg.price.toLocaleString('tr-TR')}₺
                          </span>
                          <span className="text-gray-600 ml-2 text-lg">/{pkg.duration}</span>
                        </div>
                        {pkg.originalPrice && (
                          <div className="text-center mb-3">
                            <span className="text-xl text-gray-400 line-through mr-2 font-medium">{pkg.originalPrice.toLocaleString('tr-TR')}₺</span>
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                              <Sparkles className="w-4 h-4 mr-1 inline" />
                              %{Math.round((1 - pkg.price / pkg.originalPrice) * 100)} İNDİRİM
                            </span>
                          </div>
                        )}
                        <div className="text-center">
                          <span className="text-sm text-blue-600 font-semibold">12 aya varan taksit imkanı</span>
                        </div>
                      </div>
                    </div>

                    {/* Target Audience */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-100 group-hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-blue-600" />
                      Hedef Kitle
                    </h4>
                    <p className="text-blue-800 font-medium">{pkg.targetAudience}</p>
                  </div>
                </div>

                {/* Weekly Lessons */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100 group-hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                    {pkg.weeklyLessons}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {pkg.lessonDetails.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="flex items-center space-x-3 p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                        <span className="text-purple-800 font-medium">{lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-blue-600" />
                    Paket İçeriği
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group/feature">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform duration-300">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700 leading-relaxed font-medium group-hover/feature:text-gray-900 transition-colors duration-300">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* CTA Button */}
                  <div className="relative">
                    <button
                      onClick={() => handlePurchaseClick(pkg)}
                      disabled={purchaseLoading === pkg.id}
                      className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600'
                          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl`}
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {purchaseLoading === pkg.id ? (
                        <div className="flex items-center justify-center relative z-10">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          İşleniyor...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center relative z-10">
                          <CreditCard className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                          <span className="group-hover:tracking-wide transition-all duration-300">Hemen Satın Al</span>
                          <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </button>
                    
                    {/* Button Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}></div>
                  </div>
                  
                </div>
              </div>
              )) : (
                <div className="col-span-full text-center py-20">
                  <div className="text-gray-500 text-lg">Henüz paket bulunamadı.</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-white/20 px-6 py-3 rounded-full text-white font-semibold mb-8 backdrop-blur-sm border border-white/30">
            <Sparkles className="w-5 h-5 mr-2" />
            Başarıya Giden Yol
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Başarı Yolculuğunuz{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Burada Başlıyor!
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Uzman öğretmenlerimiz, kişiye özel programlarımız ve modern eğitim teknolojilerimizle 
            hedefinize ulaşmanız için buradayız.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-purple-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 flex items-center"
            >
              <GraduationCap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Atlas'la Maceraya Başla
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="group border-3 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm hover:scale-105 flex items-center"
            >
              <MessageSquare className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Ücretsiz Danışmanlık
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/90">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Başarılı Öğrenci</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Uzman Öğretmen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-blue-200">Memnuniyet Oranı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Installment Modal */}
      {showInstallmentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowInstallmentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${selectedPackage.gradient} rounded-xl mb-4`}>
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedPackage.name}
              </h3>
              <p className="text-gray-600">
                Taksit seçeneğinizi belirleyin
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Taksit Sayısı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {installmentOptions.map((option) => {
                  const monthlyAmount = Math.ceil(selectedPackage.price / option);
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedInstallments(option)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedInstallments === option
                          ? `border-blue-500 bg-blue-50 text-blue-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">{option}x</div>
                      <div className="text-xs text-gray-600">
                        {monthlyAmount.toLocaleString('tr-TR')}₺
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Toplam Tutar:</span>
                <span className="font-bold text-lg">
                  {selectedPackage.price.toLocaleString('tr-TR')}₺
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Aylık Ödeme:</span>
                <span className="font-bold text-lg text-blue-600">
                  {Math.ceil(selectedPackage.price / selectedInstallments).toLocaleString('tr-TR')}₺
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInstallmentModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchaseLoading === selectedPackage.id}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r ${selectedPackage.gradient} hover:shadow-lg transition-all disabled:opacity-50`}
              >
                {purchaseLoading === selectedPackage.id ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    İşleniyor...
                  </div>
                ) : (
                  'Ödemeye Geç'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;