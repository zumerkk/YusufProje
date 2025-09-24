import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

async function addMockPackages() {
  try {
    logger.info('Adding mock packages to database...');

    // LGS Destek Paketi
    const lgsPackage = {
      id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
      name: 'Atlas Derslik LGS Destek Paketi',
      subtitle: '8. Sınıf LGS Hazırlık',
      description: 'LGS\'de hedeflenen puanın üstüne çıkmak için motivasyon ve sınav kaygısı yönetimi ile desteklenen tam kapsamlı hazırlık programı',
      price: 3499900,
      original_price: 5500000,
      duration: 'yıllık',
      target_audience: '8. sınıf öğrencileri için LGS\'ye özel hazırlanmış yoğun program',
      weekly_lessons: 'Haftada 10 canlı ders',
      lesson_details: [
        'Matematik: 3 Ders',
        'Fen Bilimleri: 3 Ders',
        'Türkçe: 2 Ders',
        'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
        'İngilizce: 1 Ders',
        'Din Kültürü ve Ahlak Bilgisi Tekrar Kampı'
      ],
      features: [
        'Uzman Öğretmenler Eşliğinde İnteraktif Dersler',
        '10 Kişilik VIP Gruplar',
        'Özel Hazırlık Çalışmaları',
        'Psikolojik Danışman Desteği',
        'Düzenli Deneme Analizleri',
        'Ödev Takip Sistemi',
        'Öğrenci Paneli ve İlerleme Takip Sistemi',
        'Ders Kayıtları ve Gelişim Raporları',
        'Motivasyon ve Sınav Kaygısı Yönetimi',
        'Bireysel İhtiyaçlara Odaklanma',
        'Akademik Destek Seminerleri'
      ],
      is_popular: true,
      is_premium: false,
      icon: 'Crown',
      gradient: 'from-orange-500 to-red-400',
      bg_color: 'bg-orange-50',
      text_color: 'text-orange-600',
      is_active: true
    };

    // Okul Destek Paketi
    const okulPackage = {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Atlas Derslik Okul Destek Paketi',
      subtitle: '5-6-7. Sınıflar',
      description: 'Okula ve derslere adaptasyon süreçlerini destekleyen kapsamlı eğitim programı',
      price: 2999900,
      original_price: 4500000,
      duration: 'yıllık',
      target_audience: '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
      weekly_lessons: 'Haftada 8 canlı ders',
      lesson_details: [
        'Matematik: 2 Ders',
        'Fen Bilimleri: 2 Ders',
        'Türkçe: 2 Ders',
        'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
        'İngilizce: 1 Ders'
      ],
      features: [
        'Uzman Öğretmenler Eşliğinde İnteraktif Dersler',
        '10 Kişilik VIP Gruplar',
        'Yazılılara Hazırlık Çalışmaları',
        'Psikolojik Danışman Desteği',
        'Düzenli Deneme Analizleri',
        'Ödev Takip Sistemi',
        'Öğrenci Paneli ve İlerleme Takip Sistemi',
        'Ders Kayıtlarına Erişim',
        'Sorumluluk Bilinci Geliştirme',
        'Akademik Destek Seminerleri'
      ],
      is_popular: false,
      is_premium: false,
      icon: 'BookOpen',
      gradient: 'from-blue-500 to-cyan-400',
      bg_color: 'bg-blue-50',
      text_color: 'text-blue-600',
      is_active: true
    };

    // LGS Paketini ekle/güncelle
    const { error: lgsError } = await supabase
      .from('packages')
      .upsert(lgsPackage, { onConflict: 'id' });

    if (lgsError) {
      logger.error('LGS package upsert error:', lgsError);
    } else {
      logger.info('✅ LGS Destek Paketi eklendi/güncellendi');
    }

    // Okul Paketini ekle/güncelle  
    const { error: okulError } = await supabase
      .from('packages')
      .upsert(okulPackage, { onConflict: 'id' });

    if (okulError) {
      logger.error('Okul package upsert error:', okulError);
    } else {
      logger.info('✅ Okul Destek Paketi eklendi/güncellendi');
    }

    // Kontrol et
    const { data: packages, error: selectError } = await supabase
      .from('packages')
      .select('id, name, price, is_active')
      .eq('is_active', true);

    if (selectError) {
      logger.error('Package select error:', selectError);
    } else {
      logger.info('📦 Aktif Paketler:', packages);
    }

    logger.info('🎉 Mock packages başarıyla eklendi!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Mock packages ekleme hatası:', error);
    process.exit(1);
  }
}

addMockPackages();
