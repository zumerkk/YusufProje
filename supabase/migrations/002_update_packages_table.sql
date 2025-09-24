-- Add missing columns to packages table
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS duration VARCHAR(50) DEFAULT 'yıllık',
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS weekly_lessons VARCHAR(100),
ADD COLUMN IF NOT EXISTS lesson_details JSONB,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS icon VARCHAR(100),
ADD COLUMN IF NOT EXISTS gradient VARCHAR(100),
ADD COLUMN IF NOT EXISTS bg_color VARCHAR(100),
ADD COLUMN IF NOT EXISTS text_color VARCHAR(100);

-- Update payments table to match our requirements
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Update student_packages table to match our requirements
ALTER TABLE student_packages 
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS remaining_lessons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0;

-- Update payment_installments table
ALTER TABLE payment_installments 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS iyzico_installment_id VARCHAR(255);

-- Change due_date column type in payment_installments
ALTER TABLE payment_installments 
ALTER COLUMN due_date TYPE DATE;

-- Update amount columns to use INTEGER (kuruş)
ALTER TABLE payments 
ALTER COLUMN amount TYPE INTEGER USING (amount * 100);

ALTER TABLE payment_installments 
ALTER COLUMN amount TYPE INTEGER USING (amount * 100);

-- Add 'failed' status to payment_installments if not exists
ALTER TABLE payment_installments 
DROP CONSTRAINT IF EXISTS payment_installments_status_check;

ALTER TABLE payment_installments 
ADD CONSTRAINT payment_installments_status_check 
CHECK (status IN ('pending', 'paid', 'overdue', 'failed'));

-- Enable RLS on packages table
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for packages (public read access)
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON packages TO anon;
GRANT ALL PRIVILEGES ON packages TO authenticated;
GRANT ALL PRIVILEGES ON student_packages TO authenticated;
GRANT ALL PRIVILEGES ON payments TO authenticated;
GRANT ALL PRIVILEGES ON payment_installments TO authenticated;

-- Update existing packages with new data
UPDATE packages SET 
  subtitle = '5-6-7. Sınıflar',
  original_price = 4500000,
  duration = 'yıllık',
  target_audience = '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
  weekly_lessons = 'Haftada 8 canlı ders',
  lesson_details = '["Matematik: 2 Ders", "Fen Bilimleri: 2 Ders", "Türkçe: 2 Ders", "T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders", "İngilizce: 1 Ders"]'::jsonb,
  is_popular = false,
  is_premium = false,
  icon = 'BookOpen',
  gradient = 'from-blue-500 to-cyan-400',
  bg_color = 'bg-blue-50',
  text_color = 'text-blue-600'
WHERE name = 'Atlas Derslik Okul Destek Paketi';

-- Insert sample packages if they don't exist
INSERT INTO packages (
  name, subtitle, description, price, original_price, duration,
  target_audience, weekly_lessons, lesson_details, features,
  is_popular, is_premium, icon, gradient, bg_color, text_color
) 
SELECT 
  'Atlas Derslik Okul Destek Paketi',
  '5-6-7. Sınıflar',
  'Okula ve derslere adaptasyon süreçlerini destekleyen kapsamlı eğitim programı',
  2999900,
  4500000,
  'yıllık',
  '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
  'Haftada 8 canlı ders',
  '["Matematik: 2 Ders", "Fen Bilimleri: 2 Ders", "Türkçe: 2 Ders", "T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders", "İngilizce: 1 Ders"]'::jsonb,
  '[{"text": "Uzman Öğretmenler Eşliğinde İnteraktif Dersler", "icon": "GraduationCap"}, {"text": "10 Kişilik VIP Gruplar", "icon": "Users"}, {"text": "Yazılılara Hazırlık Çalışmaları", "icon": "BookOpen"}, {"text": "Psikolojik Danışman Desteği", "icon": "MessageSquare"}, {"text": "Düzenli Deneme Analizleri", "icon": "BarChart3"}, {"text": "Ödev Takip Sistemi", "icon": "Target"}, {"text": "Öğrenci Paneli ve İlerleme Takip Sistemi", "icon": "TrendingUp"}, {"text": "Ders Kayıtlarına Erişim", "icon": "Award"}, {"text": "Sorumluluk Bilinci Geliştirme", "icon": "Sparkles"}, {"text": "Akademik Destek Seminerleri", "icon": "GraduationCap"}]'::jsonb,
  false,
  false,
  'BookOpen',
  'from-blue-500 to-cyan-400',
  'bg-blue-50',
  'text-blue-600'
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Atlas Derslik Okul Destek Paketi'
);

INSERT INTO packages (
  name, subtitle, description, price, original_price, duration,
  target_audience, weekly_lessons, lesson_details, features,
  is_popular, is_premium, icon, gradient, bg_color, text_color
) 
SELECT 
  'Atlas Derslik LGS Destek Paketi',
  '8. Sınıf LGS Hazırlık',
  'LGS''de hedeflenen puanın üstüne çıkmak için motivasyon ve sınav kaygısı yönetimi ile desteklenen tam kapsamlı hazırlık programı',
  3499900,
  5500000,
  'yıllık',
  '8. sınıf öğrencileri için LGS''ye özel hazırlanmış yoğun program',
  'Haftada 10 canlı ders',
  '["Matematik: 3 Ders", "Fen Bilimleri: 3 Ders", "Türkçe: 2 Ders", "T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders", "İngilizce: 1 Ders", "Din Kültürü ve Ahlak Bilgisi Tekrar Kampı"]'::jsonb,
  '[{"text": "Uzman Öğretmenler Eşliğinde İnteraktif Dersler", "icon": "GraduationCap"}, {"text": "10 Kişilik VIP Gruplar", "icon": "Users"}, {"text": "Özel Hazırlık Çalışmaları (Yazılı Öncesi)", "icon": "Clock"}, {"text": "Psikolojik Danışman Desteği", "icon": "MessageSquare"}, {"text": "Düzenli Deneme Analizleri", "icon": "BarChart3"}, {"text": "Ödev Takip Sistemi", "icon": "Target"}, {"text": "Öğrenci Paneli ve İlerleme Takip Sistemi", "icon": "TrendingUp"}, {"text": "Ders Kayıtları ve Gelişim Raporları", "icon": "Award"}, {"text": "Motivasyon ve Sınav Kaygısı Yönetimi", "icon": "Sparkles"}, {"text": "Bireysel İhtiyaçlara Odaklanma", "icon": "PlayCircle"}, {"text": "Akademik Destek Seminerleri", "icon": "GraduationCap"}]'::jsonb,
  true,
  false,
  'Crown',
  'from-orange-500 to-red-400',
  'bg-orange-50',
  'text-orange-600'
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Atlas Derslik LGS Destek Paketi'
);