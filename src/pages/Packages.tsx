import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface PackageFeature {
  text: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  features: PackageFeature[];
  popular?: boolean;
  premium?: boolean;
  icon: React.ReactNode;
  color: string;
}

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Temel Paket',
    price: 99,
    originalPrice: 149,
    duration: 'aylık',
    description: 'Öğrenmeye yeni başlayanlar için ideal',
    icon: <Star className="h-6 w-6" />,
    color: 'blue',
    features: [
      { text: '5 farklı ders konusu', included: true },
      { text: 'Temel video içerikler', included: true },
      { text: 'Sınırlı öğretmen desteği', included: true },
      { text: 'Mobil uygulama erişimi', included: true },
      { text: 'Temel raporlama', included: true },
      { text: 'Canlı ders katılımı', included: false },
      { text: 'Kişisel öğretmen', included: false },
      { text: 'Sınırsız soru sorma', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Paket',
    price: 199,
    originalPrice: 299,
    duration: 'aylık',
    description: 'En popüler seçim - Kapsamlı öğrenme deneyimi',
    icon: <Crown className="h-6 w-6" />,
    color: 'orange',
    popular: true,
    features: [
      { text: '15 farklı ders konusu', included: true },
      { text: 'HD video içerikler', included: true },
      { text: 'Öncelikli öğretmen desteği', included: true },
      { text: 'Mobil uygulama erişimi', included: true },
      { text: 'Detaylı raporlama', included: true },
      { text: 'Haftalık canlı dersler', included: true },
      { text: 'Grup çalışmaları', included: true },
      { text: 'Sınırsız soru sorma', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Paket',
    price: 349,
    originalPrice: 499,
    duration: 'aylık',
    description: 'Profesyonel seviye öğrenciler için',
    icon: <Zap className="h-6 w-6" />,
    color: 'purple',
    premium: true,
    features: [
      { text: 'Tüm ders konularına erişim', included: true },
      { text: '4K video içerikler', included: true },
      { text: 'Kişisel öğretmen ataması', included: true },
      { text: 'Mobil uygulama erişimi', included: true },
      { text: 'Gelişmiş analitik raporlar', included: true },
      { text: 'Günlük canlı dersler', included: true },
      { text: 'Birebir özel dersler', included: true },
      { text: 'Sınırsız soru sorma', included: true },
    ],
  },
];

const Packages: React.FC = () => {
  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'button') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Öğrenme Paketlerimiz
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            İhtiyaçlarınıza uygun paketi seçin ve öğrenme yolculuğunuza başlayın.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <button className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium">
              Aylık
            </button>
            <button className="px-6 py-2 rounded-md text-gray-600 font-medium hover:text-gray-900">
              Yıllık (2 ay ücretsiz)
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                pkg.popular ? 'border-orange-200 scale-105' : 'border-gray-200'
              } ${pkg.premium ? 'border-purple-200' : ''}`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    En Popüler
                  </span>
                </div>
              )}

              {/* Premium Badge */}
              {pkg.premium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Premium
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Package Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${getColorClasses(pkg.color, 'bg')} ${getColorClasses(pkg.color, 'text')} mb-4`}>
                    {pkg.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  {/* Pricing */}
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">₺{pkg.price}</span>
                    <span className="text-gray-600 ml-2">/{pkg.duration}</span>
                  </div>
                  {pkg.originalPrice && (
                    <div className="text-center">
                      <span className="text-lg text-gray-500 line-through">₺{pkg.originalPrice}</span>
                      <span className="ml-2 text-green-600 font-medium">
                        %{Math.round((1 - pkg.price / pkg.originalPrice) * 100)} indirim
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          feature.included ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`ml-3 text-sm ${
                        feature.included ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  to={`/register?package=${pkg.id}`}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                    getColorClasses(pkg.color, 'button')
                  }`}
                >
                  Paketi Seç
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Sıkça Sorulan Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Paket değişikliği yapabilir miyim?
              </h3>
              <p className="text-gray-600">
                Evet, istediğiniz zaman paketinizi yükseltebilir veya düşürebilirsiniz. 
                Değişiklik bir sonraki fatura döneminde geçerli olur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                İptal politikası nasıl çalışır?
              </h3>
              <p className="text-gray-600">
                İstediğiniz zaman paketinizi iptal edebilirsiniz. 
                İptal işlemi sonrası mevcut dönem sonuna kadar hizmetlerimizi kullanabilirsiniz.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Öğretmen desteği nasıl çalışır?
              </h3>
              <p className="text-gray-600">
                Paketinize göre farklı seviyede öğretmen desteği alırsınız. 
                Premium ve Pro paketlerde öncelikli destek ve kişisel öğretmen ataması vardır.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                İptal etmek istediğimde ne olur?
              </h3>
              <p className="text-gray-600">
                İstediğiniz zaman iptal edebilirsiniz. Mevcut dönem sonuna kadar 
                hizmetlerimizi kullanmaya devam edebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Hangi paketin size uygun olduğundan emin değil misiniz?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Bizimle İletişime Geçin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Packages;