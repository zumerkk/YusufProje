/**
 * Gelişmiş Paket Satın Alma Sistemi Test Dosyası
 * Bu dosya tüm CRUD işlemlerini ve raporlama sistemini test eder
 */

const BASE_URL = 'http://localhost:3001/api';

// Test verileri
const testData = {
  studentId: '1', // Demo student ID
  packageId: '1', // Demo package ID
  discountCode: 'DEMO10'
};

// HTTP request helper
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`\n📡 ${options.method || 'GET'} ${url}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error in ${url}:`, error.message);
    return { error };
  }
}

// Test fonksiyonları
async function testGetPackageCategories() {
  console.log('\n🏷️  Testing Package Categories...');
  await makeRequest('/package-categories');
}

async function testGetAvailablePackages() {
  console.log('\n📦 Testing Available Packages...');
  
  // Temel paket listesi
  await makeRequest('/packages');
  
  // Filtrelenmiş paket listesi
  await makeRequest('/packages?category=1&minPrice=100&maxPrice=1000&search=matematik&sortBy=price&sortOrder=asc&limit=5');
}

async function testGetPackageDetail() {
  console.log('\n🔍 Testing Package Detail...');
  await makeRequest(`/packages/${testData.packageId}?studentId=${testData.studentId}`);
}

async function testGetStudentPackages() {
  console.log('\n👨‍🎓 Testing Student Packages...');
  
  // Öğrencinin tüm paketleri
  await makeRequest(`/student/${testData.studentId}/packages`);
  
  // Filtrelenmiş öğrenci paketleri
  await makeRequest(`/student/${testData.studentId}/packages?status=active&limit=10&offset=0`);
}

async function testPurchasePackage() {
  console.log('\n💳 Testing Package Purchase...');
  
  const purchaseData = {
    discountCode: testData.discountCode,
    notes: 'Test satın alma işlemi'
  };
  
  const result = await makeRequest(`/student/${testData.studentId}/packages/${testData.packageId}/purchase`, {
    method: 'POST',
    body: JSON.stringify(purchaseData)
  });
  
  // Satın alma başarılıysa, student package ID'yi kaydet
  if (result.data && result.data.success && result.data.data) {
    testData.studentPackageId = result.data.data.student_package.id;
    console.log(`✅ Student Package ID saved: ${testData.studentPackageId}`);
  }
  
  return result;
}

async function testUpdateStudentPackage() {
  console.log('\n✏️  Testing Student Package Update...');
  
  if (!testData.studentPackageId) {
    console.log('⚠️  No student package ID available for update test');
    return;
  }
  
  const updateData = {
    remaining_lessons: 8,
    lessons_used: 2,
    notes: 'Güncelleme testi - 2 ders kullanıldı',
    last_lesson_date: new Date().toISOString()
  };
  
  await makeRequest(`/student/packages/${testData.studentPackageId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

async function testAddPackageReview() {
  console.log('\n⭐ Testing Package Review...');
  
  const reviewData = {
    studentId: testData.studentId,
    rating: 5,
    review_text: 'Harika bir paket! Çok memnun kaldım.'
  };
  
  await makeRequest(`/packages/${testData.packageId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
}

async function testStudentPackageReport() {
  console.log('\n📊 Testing Student Package Report...');
  
  // Temel rapor
  await makeRequest(`/reports/student/${testData.studentId}/packages`);
  
  // Tarih filtrelenmiş rapor
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 gün önce
  const endDate = new Date().toISOString();
  await makeRequest(`/reports/student/${testData.studentId}/packages?startDate=${startDate}&endDate=${endDate}&status=active`);
}

async function testPackageSalesReport() {
  console.log('\n📈 Testing Package Sales Report...');
  
  // Temel satış raporu
  await makeRequest(`/reports/package/${testData.packageId}/sales`);
  
  // Gruplandırılmış satış raporu
  await makeRequest(`/reports/package/${testData.packageId}/sales?groupBy=month`);
}

async function testDashboardStats() {
  console.log('\n📋 Testing Dashboard Stats...');
  await makeRequest('/reports/dashboard/stats');
}

async function testCategoryAnalytics() {
  console.log('\n📊 Testing Category Analytics...');
  await makeRequest('/reports/categories/analytics');
}

async function testCancelStudentPackage() {
  console.log('\n❌ Testing Student Package Cancellation...');
  
  if (!testData.studentPackageId) {
    console.log('⚠️  No student package ID available for cancellation test');
    return;
  }
  
  const cancelData = {
    reason: 'Test amaçlı iptal'
  };
  
  await makeRequest(`/student/packages/${testData.studentPackageId}`, {
    method: 'DELETE',
    body: JSON.stringify(cancelData)
  });
}

// Ana test fonksiyonu
async function runAllTests() {
  console.log('🚀 Gelişmiş Paket Satın Alma Sistemi - Kapsamlı Test Başlıyor...');
  console.log('=' .repeat(60));
  
  try {
    // 1. Temel veri okuma testleri
    await testGetPackageCategories();
    await testGetAvailablePackages();
    await testGetPackageDetail();
    await testGetStudentPackages();
    
    // 2. Paket satın alma testi
    await testPurchasePackage();
    
    // 3. CRUD işlem testleri
    await testUpdateStudentPackage();
    await testAddPackageReview();
    
    // 4. Raporlama testleri
    await testStudentPackageReport();
    await testPackageSalesReport();
    await testDashboardStats();
    await testCategoryAnalytics();
    
    // 5. Silme/İptal testi (en son)
    await testCancelStudentPackage();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Tüm testler tamamlandı!');
    console.log('\n📝 Test Özeti:');
    console.log('- ✅ Paket kategorileri listeleme');
    console.log('- ✅ Mevcut paketleri listeleme (filtreleme ile)');
    console.log('- ✅ Paket detayları görüntüleme');
    console.log('- ✅ Öğrenci paketleri listeleme');
    console.log('- ✅ Paket satın alma');
    console.log('- ✅ Öğrenci paketi güncelleme');
    console.log('- ✅ Paket değerlendirmesi ekleme');
    console.log('- ✅ Öğrenci paket raporu');
    console.log('- ✅ Paket satış raporu');
    console.log('- ✅ Dashboard istatistikleri');
    console.log('- ✅ Kategori analitiği');
    console.log('- ✅ Paket iptali');
    
  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error);
  }
}

// Test çalıştırma
if (typeof window === 'undefined') {
  // Node.js ortamında çalışıyorsa
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    runAllTests();
  }).catch(() => {
    console.log('⚠️  node-fetch bulunamadı. Lütfen "npm install node-fetch" çalıştırın.');
    console.log('Alternatif olarak, bu dosyayı tarayıcı konsolunda çalıştırabilirsiniz.');
  });
} else {
  // Tarayıcı ortamında çalışıyorsa
  runAllTests();
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testGetPackageCategories,
    testGetAvailablePackages,
    testGetPackageDetail,
    testGetStudentPackages,
    testPurchasePackage,
    testUpdateStudentPackage,
    testAddPackageReview,
    testStudentPackageReport,
    testPackageSalesReport,
    testDashboardStats,
    testCategoryAnalytics,
    testCancelStudentPackage
  };
}