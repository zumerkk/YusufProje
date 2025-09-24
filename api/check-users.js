import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Supabase bağlantısı
const supabaseUrl = 'https://cvmkqazxtgrrsqcfctzk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWtxYXp4dGdycnNxY2ZjdHprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0MDM5OCwiZXhwIjoyMDcyOTE2Mzk4fQ.KlN5ttIoejjuwzfCqPkpkLVVSMd6y_YaOEY4e_QsobU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    console.log('=== VERİTABANINDAKİ KULLANICILAR ===\n');
    
    // Tüm kullanıcıları getir
    const { data: users, error } = await supabase
      .from('users')
      .select('email, password_hash, role, is_active')
      .order('email');
    
    if (error) {
      console.error('Hata:', error);
      return;
    }
    
    console.log(`Toplam ${users.length} kullanıcı bulundu:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Kullanıcı:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Password Hash: ${user.password_hash}`);
      console.log('');
    });
    
    // Demo kullanıcıları özel olarak kontrol et
    console.log('\n=== DEMO KULLANICILARI DETAYLI KONTROL ===\n');
    
    const demoEmails = [
      'demo.ogrenci@dersatlasi.com',
      'demo.ogretmen@dersatlasi.com', 
      'demo.admin@dersatlasi.com'
    ];
    
    for (const email of demoEmails) {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`✓ ${email} bulundu:`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.is_active}`);
        console.log(`  Hash: ${user.password_hash}`);
        
        // Şifre kontrolü
        try {
          const isMatch = await bcrypt.compare('demo123456', user.password_hash);
          console.log(`  'demo123456' şifresi eşleşiyor: ${isMatch ? '✓ EVET' : '✗ HAYIR'}`);
        } catch (err) {
          console.log(`  Şifre kontrolü hatası: ${err.message}`);
        }
      } else {
        console.log(`✗ ${email} bulunamadı!`);
      }
      console.log('');
    }
    
    // Admin kullanıcıları kontrol et
    console.log('\n=== ADMIN KULLANICILARI ===\n');
    
    const adminUsers = users.filter(u => u.role === 'admin');
    console.log(`Toplam ${adminUsers.length} admin kullanıcı bulundu:\n`);
    
    for (const admin of adminUsers) {
      console.log(`Admin: ${admin.email}`);
      console.log(`  Active: ${admin.is_active}`);
      console.log(`  Hash: ${admin.password_hash}`);
      
      // admin123 şifresi kontrolü
      try {
        const isMatch = await bcrypt.compare('admin123', admin.password_hash);
        console.log(`  'admin123' şifresi eşleşiyor: ${isMatch ? '✓ EVET' : '✗ HAYIR'}`);
      } catch (err) {
        console.log(`  Şifre kontrolü hatası: ${err.message}`);
      }
      console.log('');
    }
    
    // Hash analizi
    console.log('\n=== HASH ANALİZİ ===\n');
    
    const testPassword = 'demo123456';
    console.log(`Test şifresi: ${testPassword}`);
    
    // Yeni hash oluştur
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log(`Yeni oluşturulan hash: ${newHash}`);
    
    // Mevcut hash'leri test et
    const uniqueHashes = [...new Set(users.map(u => u.password_hash))];
    console.log(`\nToplam ${uniqueHashes.length} farklı hash bulundu:\n`);
    
    for (let i = 0; i < uniqueHashes.length; i++) {
      const hash = uniqueHashes[i];
      console.log(`Hash ${i + 1}: ${hash}`);
      
      try {
        const isMatch = await bcrypt.compare(testPassword, hash);
        console.log(`  '${testPassword}' ile eşleşiyor: ${isMatch ? '✓ EVET' : '✗ HAYIR'}`);
      } catch (err) {
        console.log(`  Test hatası: ${err.message}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Genel hata:', error);
  }
}

checkUsers();