import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Play,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import baykusImage from '../assets/baykus.gif';

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleElements, setVisibleElements] = useState<number[]>([]);

  useEffect(() => {
    // Sayfa yüklenme animasyonu
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Scroll animasyonları için intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleElements(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Animasyon için elementleri gözlemle
    const animatedElements = document.querySelectorAll('[data-index]');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);


  const features = [
    {
      icon: Users,
      title: 'Canlı Rehberlik ve Anında Destek',
      description: 'Sadece video izleme, canlı etkileşime geç! Uzman öğretmenler eşliğindeki interaktif grup derslerimize katıl, anlamadığın yeri anında sor, cevabını anında al. Dersleri pasif dinleme değil, aktif bir keşfe dönüştür.'
    },
    {
      icon: Users,
      title: 'Sınıf Motivasyonu, Tek Başına Değil',
      description: 'Evden çalışmanın yalnızlığına son! Aynı hedeflere koşan akranlarınla aynı sınıfta olmanın motivasyonunu yaşa. Soru soran, tartışan, birlikte öğrenen bir topluluğun parçası ol, enerjini yükselt.'
    },
    {
      icon: Target,
      title: 'Uygun Maliyet, Premium Kalite',
      description: 'Kaliteli eğitimi uygun fiyata al! Özel ders tadında bir eğitimi, grup dersinin ekonomik avantajıyla sunuyoruz. Maximum verimi, minimum bütçe ile elde et.'
    },
    {
      icon: Clock,
      title: 'Düzen ve Disiplin için Planlı Dersler',
      description: '"Nasıl olsa video duruyor" ertelemesine izin verme! Belirli gün ve saatlerdeki canlı derslerimiz, sana düzenli bir çalışma rutini kazandırır. Öğrenmeyi bir alışkanlık haline getir.'
    },
    {
      icon: Star,
      title: 'Akran Öğrenmesi ile Pekiştir',
      description: 'Sadece öğretmenden değil, arkadaşından da öğren! Grup derslerinde diğer öğrencilerin sorduğu sorular ve yaptığı yorumlar, konuyu farklı açılardan görmeni sağlar. Bu, en güçlü öğrenme yöntemlerinden biridir.'
    },
    {
      icon: CheckCircle,
      title: 'Eksiklerini Grup Dinamiği ile Gör ve Tamamla',
      description: '"Herkes anladı, ben mi anlamadım?" demeyeceksin! Canlı derslerde yapılan anlık anketler ve soru-cevaplar ile kendi seviyeni akranlarınla kıyasla, eksiğin olduğu noktaları fark et ve öğretmenine anında geri bildirimde bulun.'
    },
  ];

  const activeSubjects = [
    'Türkçe', 'Matematik', 'Fen Bilimleri', 'T.C. İnkılap Tarihi ve Atatürkçülük', 'Yabancı Dil', 'Sosyal Bilgiler'
  ];

  const passiveSubjects = [
    'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe'
  ];

  return (
    <div className="min-h-screen">
      {/* Loading Animation */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center z-50">
          <div className="text-center">
            <img 
              src={baykusImage} 
              alt="Baykuş" 
              className="w-32 h-32 mx-auto mb-4 animate-bounce"
            />
            <div className="text-white text-xl font-semibold animate-pulse">
              Atlas Derslik Yükleniyor...
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-400 rounded-full opacity-30 animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-25 animate-ping delay-2000"></div>
        </div>
        
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className={`text-4xl lg:text-6xl font-bold leading-tight transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  Derslerde kaybolma
                  <span className="block text-orange-400">Atlas Derslik</span>
                  yanında
                </h1>
                <p className={`text-xl lg:text-2xl text-blue-100 leading-relaxed transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  Atlas Derslik, senin için açılan bir harita, keşfedeceğin her bilginin yeni bir durağı. 
                  Öğrenme serüveninde yanında bir rehberin olsun. Çünkü biliyoruz ki her zorluk, 
                  aslında keşfedilmeyi bekleyen yeni bir dünyadır.
                </p>
              </div>
              
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  Kayboldum
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/packages"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-700 hover:scale-105 transition-all duration-300 group"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Paketleri İncele
                </Link>
              </div>


            </div>

            <div className={`relative transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Ana Baykuş Karakteri */}
              <div className="relative z-10 text-center">
                <div className="relative inline-block">
                  <img
                    src={baykusImage}
                    alt="Atlas Derslik Baykuş"
                    className="w-96 h-96 mx-auto hover:scale-110 transition-transform duration-500 filter drop-shadow-2xl animate-float"
                  />
                  {/* Konuşma Balonu */}
                  <div className="absolute -top-8 -right-8 bg-white text-blue-800 px-4 py-2 rounded-full shadow-lg animate-bounce delay-1000">
                    <span className="text-sm font-semibold">Merhaba ben, Atlas</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-orange-300 animate-pulse">
                    Atlas tüm derslerde yanınızda...
                  </p>
                </div>
              </div>
              
              {/* Animasyonlu Dekoratif Elementler */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-8 w-16 h-16 bg-yellow-400 rounded-full opacity-30 animate-ping delay-2000"></div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Arka plan baykuş dekorasyonları */}
        <div className="absolute top-10 right-10 opacity-5">
          <img src={baykusImage} alt="" className="w-32 h-32 animate-spin-slow" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-5">
          <img src={baykusImage} alt="" className="w-24 h-24 animate-bounce" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.includes(10) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            data-index="10"
          >
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Neden Atlas Derslik?
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern eğitim teknolojileri ve uzman öğretmenlerimizle 
              size en iyi öğrenme deneyimini sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group ${
                    visibleElements.includes(index + 11) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index + 11}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  {/* Özel baykuş dekorasyonu bazı kartlarda */}
                  {(index === 0 || index === 2 || index === 4) && (
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <img 
                        src={baykusImage} 
                        alt="" 
                        className="w-6 h-6 mx-auto animate-bounce"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-gray-50 relative">
        {/* Floating baykuş animasyonları */}
        <div className="absolute top-20 left-1/4 opacity-10">
          <img src={baykusImage} alt="" className="w-20 h-20 animate-float" />
        </div>
        <div className="absolute bottom-20 right-1/4 opacity-10">
          <img src={baykusImage} alt="" className="w-16 h-16 animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.includes(20) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            data-index="20"
          >
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Derslerimiz
              </h2>
            </div>
            <p className="text-xl text-gray-600">
              Aktif derslerimiz ve yakında eklenecek dersler.
            </p>
          </div>

          {/* Aktif Dersler */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              <span className="text-green-600">Aktif Dersler</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {activeSubjects.map((subject, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center hover:from-green-100 hover:to-green-200 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2 group border-2 border-green-200 ${
                    visibleElements.includes(index + 21) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index + 21}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <span className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">{subject}</span>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CheckCircle className="w-4 h-4 mx-auto text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pasif Dersler */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              <span className="text-orange-600">Yakında Eklenecekler</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {passiveSubjects.map((subject, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg text-center hover:from-orange-100 hover:to-orange-200 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-2 group border-2 border-orange-200 opacity-75 ${
                    visibleElements.includes(index + 30) ? 'opacity-75 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index + 30}
                  style={{ transitionDelay: `${(index + activeSubjects.length) * 50}ms` }}
                >
                  <span className="font-medium text-gray-600 group-hover:text-orange-600 transition-colors">{subject}</span>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Clock className="w-4 h-4 mx-auto text-orange-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
        {/* Animasyonlu arka plan elementleri */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-400 rounded-full opacity-15 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-10 animate-ping"></div>
        </div>
        
        {/* Ana baykuş karakteri */}
        <div className="absolute top-10 right-20 opacity-20">
          <img 
            src={baykusImage} 
            alt="" 
            className="w-40 h-40 animate-float"
          />
        </div>
        
        <div 
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${
            visibleElements.includes(30) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-index="30"
        >
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Her ders, keşfedilecek yeni bir dünyadır.
            </h2>
          </div>
          <p className="text-xl mb-8 opacity-90">
            Biz de rehberiniziz. Var mısın keşfetmeye?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ücretsiz Kayıt Ol
            </Link>
            <Link
              to="/packages"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 hover:scale-105 transition-all duration-300"
            >
              Paketleri Görüntüle
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;