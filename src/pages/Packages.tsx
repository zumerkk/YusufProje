import React from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight
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

const packages: Package[] = [
  {
    id: 'okul-destek',
    name: 'Okul Destek Paketi',
    subtitle: '5-6-7. Sınıflar',
    price: 30,
    originalPrice: 45,
    duration: 'aylık',
    description: 'Okul derslerinde başarıyı garantileyen kapsamlı destek programı',
    targetAudience: '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
    weeklyLessons: 'Haftada 8 canlı ders',
    lessonDetails: [
      '2 ders Matematik',
      '2 ders Fen Bilimleri', 
      '2 ders Türkçe',
      '1 ders İnkılap Tarihi ve Atatürkçülük',
      '1 ders İngilizce'
    ],
    features: [
      { text: 'Uzman Öğretmenler', icon: <GraduationCap className="w-4 h-4" /> },
      { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
      { text: 'Yazılı Öncesi Hazırlık Çalışmaları', icon: <BookOpen className="w-4 h-4" /> },
      { text: 'İnteraktif ve Etkileşimli Dersler', icon: <PlayCircle className="w-4 h-4" /> },
      { text: 'Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
      { text: 'Öğrenci Paneli', icon: <Target className="w-4 h-4" /> },
      { text: 'Öğrenci İlerleme Takip Sistemi', icon: <TrendingUp className="w-4 h-4" /> },
      { text: 'Ders Kayıt Sistemi', icon: <Award className="w-4 h-4" /> },
      { text: 'Ödev Takip Sistemi', icon: <MessageSquare className="w-4 h-4" /> }
    ],
    popular: false,
    premium: false,
    icon: <BookOpen className="h-8 w-8" />,
    gradient: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 'lgs-destek',
    name: 'LGS Destek Paketi',
    subtitle: '8. Sınıf LGS Hazırlık',
    price: 35,
    originalPrice: 55,
    duration: 'aylık', 
    description: 'LGS\'de hedeflenen puanın üstüne çıkmak için tam kapsamlı hazırlık programı',
    targetAudience: '8. sınıf öğrencileri için LGS\'ye özel hazırlanmış yoğun program',
    weeklyLessons: 'Haftada 10 canlı ders',
    lessonDetails: [
      '3 ders Matematik',
      '3 ders Fen Bilimleri',
      '2 ders Türkçe', 
      '1 ders İnkılap Tarihi ve Atatürkçülük',
      '1 ders İngilizce',
      'Din Kültürü ve Ahlak Bilgisi tekrar kampı'
    ],
    features: [
      { text: 'Uzman LGS Öğretmenleri', icon: <GraduationCap className="w-4 h-4" /> },
      { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
      { text: 'Yazılı Öncesi Yoğun Hazırlık', icon: <Clock className="w-4 h-4" /> },
      { text: 'İnteraktif Canlı Dersler', icon: <PlayCircle className="w-4 h-4" /> },
      { text: 'LGS Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
      { text: 'Kişisel Gelişim Paneli', icon: <Target className="w-4 h-4" /> },
      { text: 'Detaylı İlerleme Raporları', icon: <TrendingUp className="w-4 h-4" /> },
      { text: 'Tüm Derslerin Kayıtları', icon: <Award className="w-4 h-4" /> },
      { text: 'Ödev ve Proje Takibi', icon: <MessageSquare className="w-4 h-4" /> },
      { text: 'Sürekli Gelişen Sistem', icon: <Sparkles className="w-4 h-4" /> }
    ],
    popular: true,
    premium: false,
    icon: <Crown className="h-8 w-8" />,
    gradient: 'from-orange-500 to-red-400',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
];

const stats = [
  { number: '1000+', label: 'Başarılı Öğrenci', icon: <Users className="w-6 h-6" /> },
  { number: '50+', label: 'Uzman Öğretmen', icon: <GraduationCap className="w-6 h-6" /> },
  { number: '95%', label: 'Başarı Oranı', icon: <TrendingUp className="w-6 h-6" /> },
  { number: '24/7', label: 'Destek', icon: <MessageSquare className="w-6 h-6" /> }
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Eğitim Paketlerimiz
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Uzman öğretmenler eşliğinde, kişiye özel eğitim programları ile hedeflerinize ulaşın.
              <span className="block text-yellow-300 font-semibold mt-2">
                ✨ Sınırlı zamanlı özel indirimler!
              </span>
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Size Özel Eğitim Paketleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İhtiyaçlarınıza uygun paketi seçin, başarıya giden yolda biz yanınızdayız.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 ${
                  pkg.popular ? 'border-orange-300 ring-4 ring-orange-100' : 'border-gray-200'
                }`}
                style={{animationDelay: `${index * 200}ms`}}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      <Star className="inline w-4 h-4 mr-1" />
                      EN POPÜLER PAKET
                    </div>
                  </div>
                )}

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${pkg.gradient} opacity-5 rounded-3xl`}></div>

                <div className="relative p-8 lg:p-10">
                  {/* Package Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${pkg.gradient} rounded-2xl mb-6 shadow-lg`}>
                      <div className="text-white">
                        {pkg.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-lg font-semibold text-purple-600 mb-4">{pkg.subtitle}</div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{pkg.description}</p>
                    
                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <span className={`text-5xl font-bold bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                          {pkg.price}₺
                        </span>
                        <span className="text-gray-600 ml-2 text-lg">/{pkg.duration}</span>
                      </div>
                      {pkg.originalPrice && (
                        <div className="text-center">
                          <span className="text-xl text-gray-400 line-through mr-2">{pkg.originalPrice}₺</span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            %{Math.round((1 - pkg.price / pkg.originalPrice) * 100)} İNDİRİM
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Target Audience */}
                    <div className={`${pkg.bgColor} ${pkg.textColor} p-4 rounded-xl mb-6`}>
                      <div className="font-semibold text-sm">{pkg.targetAudience}</div>
                    </div>
                  </div>

                  {/* Weekly Lessons */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Clock className={`w-5 h-5 ${pkg.textColor} mr-2`} />
                      <span className="font-bold text-lg">{pkg.weeklyLessons}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {pkg.lessonDetails.map((lesson, idx) => (
                        <div key={idx} className="flex items-center text-gray-700 text-sm">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${pkg.gradient} mr-3`}></div>
                          {lesson}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 text-center">Paket Özellikleri</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-gray-700">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${pkg.gradient} flex items-center justify-center mr-3`}>
                            <div className="text-white text-xs">
                              {feature.icon}
                            </div>
                          </div>
                          <span className="text-sm font-medium">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/register?package=${pkg.id}`}
                    className={`w-full block text-center py-4 px-8 rounded-2xl font-bold text-lg text-white bg-gradient-to-r ${pkg.gradient} hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group`}
                  >
                    <span className="relative z-10">Hemen Başla</span>
                    <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                  
                  <div className="text-center mt-4">
                    <span className="text-xs text-gray-500">14 gün para iade garantisi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Öğrencilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600">
              Binlerce öğrencinin başarı hikayelerinden sadece birkaçı
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.grade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Başarı Yolculuğunuz Burada Başlıyor!
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Uzman öğretmenlerimiz, kişiye özel programlarımız ve modern eğitim teknolojilerimizle 
            hedefinize ulaşmanız için buradayız.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center"
            >
              Ücretsiz Deneme Başlat
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            
            <div className="text-white">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">İlk 7 Gün Ücretsiz!</span>
              </div>
              <div className="text-sm text-purple-200">Kredi kartı gerektirmez</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;