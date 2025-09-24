-- E-ticaret sistemi için gerekli tabloları oluştur

-- Paketler tablosu
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Kuruş cinsinden
    features JSONB NOT NULL DEFAULT '[]',
    duration_months INTEGER NOT NULL DEFAULT 12,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_price ON packages(price);

-- Başlangıç verileri
INSERT INTO packages (name, description, price, features, duration_months) VALUES
('LGS Destek Paketi', 'LGS sınavına hazırlık için kapsamlı destek paketi', 3499900, 
 '["Canlı Dersler", "Soru Bankası", "Deneme Sınavları", "Bireysel Takip", "Akademik Destek Seminerleri"]', 12),
('Okul Destek Paketi', 'Okul derslerinde başarı için destek paketi', 2999900,
 '["Ders Takibi", "Ödev Yardımı", "Soru Çözümü", "Bireysel Danışmanlık", "Akademik Destek Seminerleri"]', 12);

-- Öğrenci paketleri tablosu
CREATE TABLE student_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    package_id UUID NOT NULL REFERENCES packages(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_student_packages_student_id ON student_packages(student_id);
CREATE INDEX idx_student_packages_status ON student_packages(status);
CREATE INDEX idx_student_packages_dates ON student_packages(start_date, end_date);

-- RLS Politikaları
ALTER TABLE student_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own packages" ON student_packages
    FOR SELECT USING (auth.uid() = student_id);

-- Ödemeler tablosu
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_package_id UUID NOT NULL REFERENCES student_packages(id),
    iyzico_payment_id VARCHAR(255),
    iyzico_conversation_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    installment_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_payments_student_package ON payments(student_package_id);
CREATE INDEX idx_payments_iyzico_id ON payments(iyzico_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS Politikaları
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_packages sp 
            WHERE sp.id = payments.student_package_id 
            AND sp.student_id = auth.uid()
        )
    );

-- Taksit tablosu
CREATE TABLE payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_installments_payment_id ON payment_installments(payment_id);
CREATE INDEX idx_installments_due_date ON payment_installments(due_date);
CREATE INDEX idx_installments_status ON payment_installments(status);

-- Unique constraint
ALTER TABLE payment_installments ADD CONSTRAINT unique_payment_installment 
    UNIQUE (payment_id, installment_number);

-- Tablolara izin ver
GRANT SELECT ON packages TO anon, authenticated;
GRANT ALL PRIVILEGES ON student_packages TO authenticated;
GRANT ALL PRIVILEGES ON payments TO authenticated;
GRANT ALL PRIVILEGES ON payment_installments TO authenticated;