import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Clock, 
  Target, 
  BookOpen, 
  Headphones, 
  Shield, 
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface Advantage {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}



const advantages: Advantage[] = [
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Canlı ve İnteraktif Grup Dersleri',
    description: 'Sıkıcı video izleme dönemini sonlandırıyor, gerçek bir sınıf deneyimini evine taşıyoruz.',
    color: 'blue',
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: 'Uzman Öğretmenler Eşliğinde Öğrenme',
    description: 'Anlamadığın her soruyu anında sorma, akranlarınla birlikte öğrenme fırsatı buluyorsun.',
    color: 'orange',
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: 'Ekonomik ve Erişilebilir Sistem',
    description: 'Kaliteli eğitimi herkes için ulaşılabilir kılıyoruz.',
    color: 'green',
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'Düzenli ve Disiplinli Çalışma',
    description: 'Planlı ders programları ve motive edici bir topluluk sunuyoruz.',
    color: 'purple',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Hızlı Eksik Tespiti',
    description: 'Eksiklerini hızlıca tespit edip grup dinamigiyle tamamlama imkânı sağlıyoruz.',
    color: 'red',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Özgüven Artırıcı Yaklaşım',
    description: 'Bilginin karmaşık yollarını birlikte aşmayı vaat ediyoruz.',
    color: 'indigo',
  },
];



const testimonials = [
  {
    name: 'Ayşe Yılmaz',
    role: 'Lise Öğrencisi',
    content: 'Atlas Derslik sayesinde matematik notlarım çok arttı. Öğretmenler gerçekten çok yardımcı.',
    rating: 5,
  },
  {
    name: 'Mehmet Kaya',
    role: 'Üniversite Öğrencisi',
    content: 'Fizik derslerinde çok zorlanıyordum. Buradaki videolar sayesinde konuları çok daha iyi anlıyorum.',
    rating: 5,
  },
  {
    name: 'Zeynep Demir',
    role: 'Veli',
    content: 'Çocuğumun gelişimini takip edebiliyorum. Raporlar çok detaylı ve faydalı.',
    rating: 5,
  },
];

const WhyUs: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Neden <span className="text-blue-600">Atlas Derslik</span>?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Çünkü derslerde kaybolduğunu hissettiğin o anlarda yanında olacak bir yol arkadaşı arıyorsan, doğru yerdesin!
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hemen Başla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>



      {/* Advantages Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Atlas Derslik ile;
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Her ders, keşfedilecek yeni bir dünyadır. Biz de rehberiniziz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${getColorClasses(advantage.color)} mb-6`}>
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sadece 3 adımda öğrenme yolculuğunuza başlayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Kayıt Olun
              </h3>
              <p className="text-gray-600">
                Hızlı ve kolay kayıt işlemi ile hesabınızı oluşturun.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Paketinizi Seçin
              </h3>
              <p className="text-gray-600">
                İhtiyaçlarınıza uygun paketi seçin. 
                İstediğiniz zaman paket değişikliği yapabilirsiniz.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Öğrenmeye Başlayın
              </h3>
              <p className="text-gray-600">
                Kişiselleştirilmiş öğrenme planınız ile 
                hedeflerinize ulaşmaya başlayın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öğrencilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Binlerce mutlu öğrencimizden bazılarının deneyimleri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Var mısın keşfetmeye?
          </h2>
          <p className="text-xl text-blue-100 mb-4">
            Her şey, senin başarına yolculuğun için.
          </p>
          <p className="text-2xl font-bold text-white mb-8">
            "Derslerde kaybolma, Atlas Derslik yanında!"
          </p>
          <div className="flex justify-center">
            <Link
              to="/packages"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Paketleri İnceleyin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;