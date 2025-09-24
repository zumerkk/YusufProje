-- Gelişmiş paket sistemi için veritabanı geliştirmeleri

-- Student_packages tablosuna eksik alanları ekle
ALTER TABLE student_packages 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS lessons_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_lesson_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS discount_applied INTEGER DEFAULT 0, -- kuruş cinsinden
ADD COLUMN IF NOT EXISTS original_amount INTEGER, -- orijinal fiyat
ADD COLUMN IF NOT EXISTS final_amount INTEGER; -- indirim sonrası fiyat

-- Packages tablosuna ek alanlar
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_age INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS prerequisites TEXT,
ADD COLUMN IF NOT EXISTS certificate_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_policy TEXT;

-- Package_categories tablosu oluştur
CREATE TABLE IF NOT EXISTS package_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package_reviews tablosu oluştur
CREATE TABLE IF NOT EXISTS package_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(package_id, student_id)
);

-- Package_discounts tablosu oluştur
CREATE TABLE IF NOT EXISTS package_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL, -- yüzde için 1-100, sabit tutar için kuruş
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package_analytics tablosu oluştur
CREATE TABLE IF NOT EXISTS package_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0, -- kuruş cinsinden
  refunds_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(package_id, date)
);

-- İndeksler ekle
CREATE INDEX IF NOT EXISTS idx_student_packages_start_date ON student_packages(start_date);
CREATE INDEX IF NOT EXISTS idx_student_packages_expiry_date ON student_packages(expiry_date);
CREATE INDEX IF NOT EXISTS idx_student_packages_lessons_used ON student_packages(lessons_used);
CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_difficulty_level ON packages(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_package_reviews_rating ON package_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_package_discounts_dates ON package_discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_package_analytics_date ON package_analytics(date);

-- RLS politikaları ekle
ALTER TABLE package_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_analytics ENABLE ROW LEVEL SECURITY;

-- Package categories için politikalar
CREATE POLICY "Anyone can view active categories" ON package_categories
  FOR SELECT USING (is_active = true);

-- Package reviews için politikalar
CREATE POLICY "Anyone can view verified reviews" ON package_reviews
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can create reviews for purchased packages" ON package_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM student_packages 
      WHERE student_id = auth.uid() 
      AND package_id = package_reviews.package_id
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own reviews" ON package_reviews
  FOR UPDATE USING (auth.uid() = student_id);

-- Package discounts için politikalar
CREATE POLICY "Anyone can view active discounts" ON package_discounts
  FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- Package analytics için politikalar (sadece admin)
CREATE POLICY "Only admins can view analytics" ON package_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Kategoriler için örnek veri
INSERT INTO package_categories (name, description, icon, color, sort_order) VALUES
('LGS Hazırlık', '8. sınıf LGS sınavına hazırlık paketleri', 'GraduationCap', 'orange', 1),
('Okul Destek', 'Okul derslerine destek paketleri', 'BookOpen', 'blue', 2),
('Yaz Okulu', 'Yaz dönemi telafi ve pekiştirme', 'Sun', 'yellow', 3),
('Özel Ders', 'Birebir özel ders paketleri', 'User', 'green', 4),
('Deneme Sınavları', 'Düzenli deneme sınavı paketleri', 'FileText', 'purple', 5)
ON CONFLICT (name) DO NOTHING;

-- Packages tablosuna kategori bağlantısı ekle
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES package_categories(id);

-- Mevcut paketleri kategorilere ata
UPDATE packages 
SET category_id = (
  SELECT id FROM package_categories 
  WHERE name = CASE 
    WHEN packages.name LIKE '%LGS%' THEN 'LGS Hazırlık'
    ELSE 'Okul Destek'
  END
)
WHERE category_id IS NULL;