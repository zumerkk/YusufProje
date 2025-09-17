import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <Target className="h-8 w-8" />,
    title: 'Hedef Odaklılık',
    description: 'Her öğrencinin hedeflerine ulaşması için kişiselleştirilmiş çözümler sunuyoruz.'
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Öğrenci Odaklılık',
    description: 'Öğrencilerimizin başarısı bizim en büyük motivasyon kaynağımızdır.'
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: 'İnovasyon',
    description: 'Eğitimde yenilikçi teknolojiler ve yöntemler kullanarak fark yaratıyoruz.'
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Kalite',
    description: 'En yüksek kalite standartlarında eğitim içeriği ve hizmet sunuyoruz.'
  }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Atlas Derslik Hakkında
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Eğitimde dijital dönüşümün öncüsü olarak, her öğrencinin 
              potansiyelini keşfetmesi için yenilikçi çözümler sunuyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-blue-50 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Atatürk'ün "Bilim ve fen nerede ise oradan alacağız ve ulusun her bireyinin kafasına koyacağız. Bilim ve fen için bağ ve koşul yoktur." sözünü kendine rehber edinen Atlas Derslik olarak; gençlerimizi ezbercilikten uzak, anlayarak öğrenmeye, eleştirel düşünmeye ve bilimi yaşam rehberi olarak benimsemeye teşvik etmek. Onlara, en kaliteli eğitimi en erişilebilir şekilde sunarak, akademik başarılarının yanı sıra özgüvenli, araştıran, sorgulayan ve ülkesine değer katma azmiyle dolu bireyler olarak yetişmeleri için destek olmak.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-orange-50 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-orange-600 p-3 rounded-lg mr-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Vizyonumuz</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Atatürk'ün işaret ettiği muasır medeniyet seviyesine, eğitimde fırsat eşitliği sağlayarak ve her bir gencimizi en iyi versiyonu olmaya teşvik ederek ulaşılmasına öncülük etmek. Türkiye'nin dört bir yanındaki gençlerin keşfedilmemiş potansiyelini, Atlas Derslik ile açığa çıkarmak ve onları geleceğin aydınlık liderleri olarak hazırlamak.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Değerlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Çalışmalarımızı yönlendiren temel değerlerimiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* CTA */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bizimle Öğrenmeye Başlayın
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Deneyimli ekibimiz ve yenilikçi platformumuzla 
            öğrenme yolculuğunuza bugün başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hemen Başla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              İletişime Geçin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;