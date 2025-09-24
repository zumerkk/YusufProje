-- Create packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price INTEGER NOT NULL, -- Price in kuruş (cents)
  original_price INTEGER,
  duration VARCHAR(50) NOT NULL,
  target_audience TEXT,
  weekly_lessons VARCHAR(100),
  lesson_details JSONB,
  features JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  icon VARCHAR(100),
  gradient VARCHAR(100),
  bg_color VARCHAR(100),
  text_color VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_packages table (purchased packages)
CREATE TABLE student_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  remaining_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  student_package_id UUID REFERENCES student_packages(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Amount in kuruş (cents)
  installments INTEGER DEFAULT 1,
  payment_method VARCHAR(50),
  iyzico_payment_id VARCHAR(255),
  iyzico_conversation_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_installments table
CREATE TABLE payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- Amount in kuruş (cents)
  due_date DATE NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'failed')),
  iyzico_installment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_student_packages_student_id ON student_packages(student_id);
CREATE INDEX idx_student_packages_package_id ON student_packages(package_id);
CREATE INDEX idx_student_packages_status ON student_packages(status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payment_installments_payment_id ON payment_installments(payment_id);
CREATE INDEX idx_payment_installments_status ON payment_installments(status);
CREATE INDEX idx_payment_installments_due_date ON payment_installments(due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Packages policies (public read access)
CREATE POLICY "Anyone can view active packages" ON packages
  FOR SELECT USING (is_active = true);

-- Student packages policies (users can only see their own packages)
CREATE POLICY "Users can view their own packages" ON student_packages
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own packages" ON student_packages
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own packages" ON student_packages
  FOR UPDATE USING (auth.uid() = student_id);

-- Payments policies (users can only see their own payments)
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (auth.uid() = student_id);

-- Payment installments policies (users can only see their own installments)
CREATE POLICY "Users can view their own installments" ON payment_installments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = payment_installments.payment_id 
      AND payments.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own installments" ON payment_installments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = payment_installments.payment_id 
      AND payments.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own installments" ON payment_installments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM payments 
      WHERE payments.id = payment_installments.payment_id 
      AND payments.student_id = auth.uid()
    )
  );

-- Insert sample packages
INSERT INTO packages (
  name, subtitle, description, price, original_price, duration,
  target_audience, weekly_lessons, lesson_details, features,
  is_popular, is_premium, icon, gradient, bg_color, text_color
) VALUES 
(
  'Atlas Derslik Okul Destek Paketi',
  '5-6-7. Sınıflar',
  'Okula ve derslere adaptasyon süreçlerini destekleyen kapsamlı eğitim programı',
  2999900, -- 29999.00 TL in kuruş
  4500000, -- 45000.00 TL in kuruş
  'yıllık',
  '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
  'Haftada 8 canlı ders',
  '["Matematik: 2 Ders", "Fen Bilimleri: 2 Ders", "Türkçe: 2 Ders", "T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders", "İngilizce: 1 Ders"]',
  '[{"text": "Uzman Öğretmenler Eşliğinde İnteraktif Dersler", "icon": "GraduationCap"}, {"text": "10 Kişilik VIP Gruplar", "icon": "Users"}, {"text": "Yazılılara Hazırlık Çalışmaları", "icon": "BookOpen"}, {"text": "Psikolojik Danışman Desteği", "icon": "MessageSquare"}, {"text": "Düzenli Deneme Analizleri", "icon": "BarChart3"}, {"text": "Ödev Takip Sistemi", "icon": "Target"}, {"text": "Öğrenci Paneli ve İlerleme Takip Sistemi", "icon": "TrendingUp"}, {"text": "Ders Kayıtlarına Erişim", "icon": "Award"}, {"text": "Sorumluluk Bilinci Geliştirme", "icon": "Sparkles"}, {"text": "Akademik Destek Seminerleri", "icon": "GraduationCap"}]',
  false,
  false,
  'BookOpen',
  'from-blue-500 to-cyan-400',
  'bg-blue-50',
  'text-blue-600'
),
(
  'Atlas Derslik LGS Destek Paketi',
  '8. Sınıf LGS Hazırlık',
  'LGS''de hedeflenen puanın üstüne çıkmak için motivasyon ve sınav kaygısı yönetimi ile desteklenen tam kapsamlı hazırlık programı',
  3499900, -- 34999.00 TL in kuruş
  5500000, -- 55000.00 TL in kuruş
  'yıllık',
  '8. sınıf öğrencileri için LGS''ye özel hazırlanmış yoğun program',
  'Haftada 10 canlı ders',
  '["Matematik: 3 Ders", "Fen Bilimleri: 3 Ders", "Türkçe: 2 Ders", "T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders", "İngilizce: 1 Ders", "Din Kültürü ve Ahlak Bilgisi Tekrar Kampı"]',
  '[{"text": "Uzman Öğretmenler Eşliğinde İnteraktif Dersler", "icon": "GraduationCap"}, {"text": "10 Kişilik VIP Gruplar", "icon": "Users"}, {"text": "Özel Hazırlık Çalışmaları (Yazılı Öncesi)", "icon": "Clock"}, {"text": "Psikolojik Danışman Desteği", "icon": "MessageSquare"}, {"text": "Düzenli Deneme Analizleri", "icon": "BarChart3"}, {"text": "Ödev Takip Sistemi", "icon": "Target"}, {"text": "Öğrenci Paneli ve İlerleme Takip Sistemi", "icon": "TrendingUp"}, {"text": "Ders Kayıtları ve Gelişim Raporları", "icon": "Award"}, {"text": "Motivasyon ve Sınav Kaygısı Yönetimi", "icon": "Sparkles"}, {"text": "Bireysel İhtiyaçlara Odaklanma", "icon": "PlayCircle"}, {"text": "Akademik Destek Seminerleri", "icon": "GraduationCap"}]',
  true,
  false,
  'Crown',
  'from-orange-500 to-red-400',
  'bg-orange-50',
  'text-orange-600'
);