import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  BarChart3,
  Users,
  DollarSign,
  Award,
  BookOpen,
  Loader2,
  Check,
  Crown,
  Target,
  PlayCircle,
  MessageSquare,
  Sparkles,
  GraduationCap,
  ChevronRight,
  CreditCard,
  X
} from 'lucide-react';

interface StudentPackage {
  id: string;
  package_id: string;
  student_id: string;
  purchase_date: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  total_lessons: number;
  remaining_lessons: number;
  lessons_used: number;
  last_lesson_date?: string;
  notes?: string;
  discount_applied?: number;
  final_amount: number;
  packages: {
    name: string;
    price: number;
    duration: string;
    category_id: string;
    package_categories: {
      name: string;
      color: string;
    };
  };
  payments: {
    amount: number;
    status: string;
  }[];
}

interface PackageFeature {
  text: string;
  icon: React.ReactNode;
}

interface AvailablePackage {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  targetAudience: string;
  weeklyLessons: string;
  lessonDetails: string[];
  features: PackageFeature[];
  popular?: boolean;
  premium?: boolean;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  textColor: string;
}

interface PackageStats {
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  cancelled_packages: number;
  total_revenue: number;
  average_package_value: number;
  most_popular_category: string;
  monthly_growth: number;
}

const PackageManagement: React.FC = () => {
  const navigate = useNavigate();
  const [studentPackages, setStudentPackages] = useState<StudentPackage[]>([]);
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([]);
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('purchase_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPackage, setSelectedPackage] = useState<StudentPackage | null>(null);
  const [selectedAvailablePackage, setSelectedAvailablePackage] = useState<AvailablePackage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState({
    remaining_lessons: 0,
    lessons_used: 0,
    notes: '',
    last_lesson_date: ''
  });

  const installmentOptions = [1, 2, 3, 6, 9, 12];

  // Static packages data from Packages.tsx
  const staticPackages: AvailablePackage[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Atlas Derslik Okul Destek Paketi',
      subtitle: '5-6-7. Sınıflar',
      price: 2999900,
      originalPrice: 4500000,
      duration: 'yıllık',
      description: 'Okula ve derslere adaptasyon süreçlerini destekleyen kapsamlı eğitim programı',
      targetAudience: '5., 6., 7. sınıf öğrencileri için özel tasarlanmıştır',
      weeklyLessons: 'Haftada 8 canlı ders',
      lessonDetails: [
        'Matematik: 2 Ders',
        'Fen Bilimleri: 2 Ders', 
        'Türkçe: 2 Ders',
        'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
        'İngilizce: 1 Ders'
      ],
      features: [
        { text: 'Uzman Öğretmenler Eşliğinde İnteraktif Dersler', icon: <GraduationCap className="w-4 h-4" /> },
        { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
        { text: 'Yazılılara Hazırlık Çalışmaları', icon: <BookOpen className="w-4 h-4" /> },
        { text: 'Psikolojik Danışman Desteği', icon: <MessageSquare className="w-4 h-4" /> },
        { text: 'Düzenli Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
        { text: 'Ödev Takip Sistemi', icon: <Target className="w-4 h-4" /> },
        { text: 'Öğrenci Paneli ve İlerleme Takip Sistemi', icon: <TrendingUp className="w-4 h-4" /> },
        { text: 'Ders Kayıtlarına Erişim', icon: <Award className="w-4 h-4" /> },
        { text: 'Sorumluluk Bilinci Geliştirme', icon: <Sparkles className="w-4 h-4" /> },
        { text: 'Akademik Destek Seminerleri', icon: <GraduationCap className="w-4 h-4" /> }
      ],
      popular: false,
      premium: false,
      icon: <BookOpen className="h-8 w-8" />,
      gradient: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
      name: 'Atlas Derslik LGS Destek Paketi',
      subtitle: '8. Sınıf LGS Hazırlık',
      price: 3499900,
      originalPrice: 5500000,
      duration: 'yıllık', 
      description: 'LGS\'de hedeflenen puanın üstüne çıkmak için motivasyon ve sınav kaygısı yönetimi ile desteklenen tam kapsamlı hazırlık programı',
      targetAudience: '8. sınıf öğrencileri için LGS\'ye özel hazırlanmış yoğun program',
      weeklyLessons: 'Haftada 10 canlı ders',
      lessonDetails: [
        'Matematik: 3 Ders',
        'Fen Bilimleri: 3 Ders',
        'Türkçe: 2 Ders', 
        'T.C. İnkılap Tarihi ve Atatürkçülük: 1 Ders',
        'İngilizce: 1 Ders',
        'Din Kültürü ve Ahlak Bilgisi Tekrar Kampı'
      ],
      features: [
        { text: 'Uzman Öğretmenler Eşliğinde İnteraktif Dersler', icon: <GraduationCap className="w-4 h-4" /> },
        { text: '10 Kişilik VIP Gruplar', icon: <Users className="w-4 h-4" /> },
        { text: 'Özel Hazırlık Çalışmaları (Yazılı Öncesi)', icon: <Clock className="w-4 h-4" /> },
        { text: 'Psikolojik Danışman Desteği', icon: <MessageSquare className="w-4 h-4" /> },
        { text: 'Düzenli Deneme Analizleri', icon: <BarChart3 className="w-4 h-4" /> },
        { text: 'Ödev Takip Sistemi', icon: <Target className="w-4 h-4" /> },
        { text: 'Öğrenci Paneli ve İlerleme Takip Sistemi', icon: <TrendingUp className="w-4 h-4" /> },
        { text: 'Ders Kayıtları ve Gelişim Raporları', icon: <Award className="w-4 h-4" /> },
        { text: 'Motivasyon ve Sınav Kaygısı Yönetimi', icon: <Sparkles className="w-4 h-4" /> },
        { text: 'Bireysel İhtiyaçlara Odaklanma', icon: <PlayCircle className="w-4 h-4" /> },
        { text: 'Akademik Destek Seminerleri', icon: <GraduationCap className="w-4 h-4" /> }
      ],
      popular: true,
      premium: false,
      icon: <Crown className="h-8 w-8" />,
      gradient: 'from-orange-500 to-red-400',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    active: <CheckCircle className="w-4 h-4" />,
    completed: <Award className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
    expired: <Clock className="w-4 h-4" />
  };

  useEffect(() => {
    fetchStudentPackages();
    fetchDashboardStats();
    setAvailablePackages(staticPackages);
  }, [currentPage, statusFilter, categoryFilter, sortBy, sortOrder, searchTerm]);

  const fetchStudentPackages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Lütfen giriş yapın');
        return;
      }
      
  

      // Get current user info
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
      
      const userData = await userResponse.json();
      const studentId = userData.user?.id;

      if (!studentId) {
        console.error('Student ID not found in user data:', userData);
        toast.error('Kullanıcı bilgisi bulunamadı');
        return;
      }

      const params = new URLSearchParams({
        status: statusFilter !== 'all' ? statusFilter : '',
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/student/${studentId}/packages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Paketler yüklenemedi');
      }

      const data = await response.json();
      const packages = data.data || [];
      setStudentPackages(packages);
      
      // Check if student has any active packages
      const activePackages = packages.filter((pkg: StudentPackage) => pkg.status === 'active');
      if (activePackages.length > 0) {
  
        setHasActivePackage(true);
      } else {
  
        setHasActivePackage(false);
      }
    } catch (error) {

      toast.error('Paketler yüklenirken hata oluştu');
      // If there's an error, assume no active packages and show available packages
      setHasActivePackage(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {

    }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Oturum bulunamadı');
        return;
      }

      const response = await fetch(`/api/student-packages/${selectedPackage.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Paket güncellenirken hata oluştu');
      }

      toast.success('Paket başarıyla güncellendi');
      setShowUpdateModal(false);
      fetchStudentPackages();
    } catch (error) {

      toast.error('Paket güncellenirken hata oluştu');
    }
  };

  const handlePurchaseClick = (pkg: AvailablePackage) => {
    setSelectedAvailablePackage(pkg);
    setSelectedInstallments(1);
    setShowInstallmentModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedAvailablePackage) {
      toast.error('Paket seçilmedi');
      return;
    }

    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      toast.error('Lütfen önce giriş yapın');
      navigate('/login');
      return;
    }

    setPurchaseLoading(selectedAvailablePackage.id);

    try {
      const paymentData = {
        package: {
          id: selectedAvailablePackage.id,
          name: selectedAvailablePackage.name,
          price: selectedAvailablePackage.price,
          duration: selectedAvailablePackage.duration,
          gradient: selectedAvailablePackage.gradient
        },
        installmentCount: selectedInstallments,
        monthlyAmount: Math.ceil(selectedAvailablePackage.price / selectedInstallments)
      };
      
      localStorage.setItem('payment_data', JSON.stringify(paymentData));
      
      setShowInstallmentModal(false);
      navigate('/payment');
    } catch (error) {

      toast.error('Bir hata oluştu');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleCancelPackage = async (packageId: string) => {
    if (!confirm('Bu paketi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/student/packages/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Kullanıcı tarafından iptal edildi'
        })
      });

      if (!response.ok) {
        throw new Error('İptal işlemi başarısız');
      }

      toast.success('Paket başarıyla iptal edildi');
      fetchStudentPackages();
    } catch (error) {

      toast.error('İptal işlemi sırasında hata oluştu');
    }
  };

  const openDetailModal = (pkg: StudentPackage) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  const openUpdateModal = (pkg: StudentPackage) => {
    setSelectedPackage(pkg);
    setUpdateData({
      remaining_lessons: pkg.remaining_lessons,
      lessons_used: pkg.lessons_used,
      notes: pkg.notes || '',
      last_lesson_date: pkg.last_lesson_date || ''
    });
    setShowUpdateModal(true);
  };

  const getProgressPercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const value = amount || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Paketler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If student has no active packages, show available packages for purchase
  if (!hasActivePackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Eğitim Paketlerimizi Keşfedin
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Uzman öğretmenlerimiz eşliğinde, kişiselleştirilmiş eğitim deneyimi yaşayın. 
              Hedeflerinize ulaşmak için en uygun paketi seçin.
            </p>
          </div>
        </div>

        {/* Packages Section */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Eğitim Paketlerimiz</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Her seviyeye uygun, kapsamlı eğitim programlarımızla akademik başarınızı artırın
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {availablePackages.map((pkg) => (
                <div key={pkg.id} className={`relative rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${pkg.popular ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50' : 'border-gray-200 bg-white'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        En Popüler
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.gradient} text-white mb-4`}>
                      {pkg.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-lg text-gray-600 mb-4">{pkg.subtitle}</p>
                    
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatCurrency(pkg.originalPrice)}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="text-gray-600">/ {pkg.duration}</span>
                    </div>
                    
                    {pkg.originalPrice && (
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Sparkles className="w-4 h-4" />
                        %{Math.round((1 - pkg.price / pkg.originalPrice) * 100)} İndirim
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Hedef Kitle
                      </h4>
                      <p className="text-gray-600">{pkg.targetAudience}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        Ders Programı
                      </h4>
                      <p className="text-gray-600 mb-2">{pkg.weeklyLessons}</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.lessonDetails.map((lesson, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Paket Özellikleri
                      </h4>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-600">
                            <div className="text-green-500">{feature.icon}</div>
                            <span className="text-sm">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchaseClick(pkg)}
                    disabled={purchaseLoading === pkg.id}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {purchaseLoading === pkg.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Paketi Satın Al
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Installment Modal */}
        {showInstallmentModal && selectedAvailablePackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Taksit Seçenekleri</h3>
                <button
                  onClick={() => setShowInstallmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedAvailablePackage.name}</h4>
                <p className="text-gray-600 mb-4">{selectedAvailablePackage.subtitle}</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedAvailablePackage.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Taksit Seçeneği
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {installmentOptions.map((option) => {
                    const monthlyAmount = selectedAvailablePackage.price / option;
                    return (
                      <button
                        key={option}
                        onClick={() => setSelectedInstallments(option)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedInstallments === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{option} Taksit</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(monthlyAmount)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6 bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Aylık Ödeme:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedAvailablePackage.price / selectedInstallments)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Tutar:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedAvailablePackage.price)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstallmentModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchaseLoading === selectedAvailablePackage.id}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchaseLoading === selectedAvailablePackage.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Ödemeye Geç
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If student has active packages, show package management interface
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paket Yönetimi</h1>
          <p className="text-gray-600">Aktif paketlerinizi görüntüleyin ve yönetin</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Paket</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_packages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Paket</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_packages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ortalama Değer</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.average_package_value)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Arama
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Paket adı ara..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
                <option value="expired">Süresi Doldu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="purchase_date">Satın Alma Tarihi</option>
                <option value="start_date">Başlangıç Tarihi</option>
                <option value="end_date">Bitiş Tarihi</option>
                <option value="final_amount">Tutar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıra
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Azalan</option>
                <option value="asc">Artan</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setSortBy('purchase_date');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {/* Package List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Paketler yükleniyor...</span>
            </div>
          ) : studentPackages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz paket bulunamadı</h3>
              <p className="text-gray-600">Filtreleri değiştirerek tekrar deneyin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlerleme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarihler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentPackages.map((pkg) => {
                    const progress = getProgressPercentage(pkg.lessons_used, pkg.total_lessons);
                    return (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: pkg.packages?.package_categories?.color || '#6B7280' }}></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{pkg.packages?.name || 'Paket'}</div>
                              <div className="text-sm text-gray-500">{pkg.packages?.package_categories?.name || pkg.packages?.category || 'Genel'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[pkg.status]}`}>
                            {statusIcons[pkg.status]}
                            <span className="ml-1 capitalize">{pkg.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {pkg.lessons_used}/{pkg.total_lessons} ders (%{progress})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Başlangıç: {formatDate(pkg.start_date)}</div>
                          <div>Bitiş: {formatDate(pkg.end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pkg.final_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDetailModal(pkg)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Detayları Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {pkg.status === 'active' && (
                              <>
                                <button
                                  onClick={() => openUpdateModal(pkg)}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Güncelle"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCancelPackage(pkg.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="İptal Et"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Paket Detayları</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paket Adı</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.packages?.name || 'Paket'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kategori</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.packages?.package_categories?.name || selectedPackage.packages?.category || 'Genel'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durum</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedPackage.status]}`}>
                        {statusIcons[selectedPackage.status]}
                        <span className="ml-1 capitalize">{selectedPackage.status}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Toplam Tutar</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedPackage.final_amount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Satın Alma Tarihi</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPackage.purchase_date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPackage.start_date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPackage.end_date)}</p>
                    </div>
                    {selectedPackage.last_lesson_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Son Ders Tarihi</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPackage.last_lesson_date)}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Toplam Ders</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.total_lessons}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kullanılan Ders</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.lessons_used}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kalan Ders</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPackage.remaining_lessons}</p>
                    </div>
                  </div>

                  {selectedPackage.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notlar</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedPackage.notes}</p>
                    </div>
                  )}

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(selectedPackage.lessons_used, selectedPackage.total_lessons)}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    İlerleme: %{getProgressPercentage(selectedPackage.lessons_used, selectedPackage.total_lessons)}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Paket Güncelle</h3>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kalan Ders Sayısı</label>
                    <input
                      type="number"
                      value={updateData.remaining_lessons}
                      onChange={(e) => setUpdateData({ ...updateData, remaining_lessons: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kullanılan Ders Sayısı</label>
                    <input
                      type="number"
                      value={updateData.lessons_used}
                      onChange={(e) => setUpdateData({ ...updateData, lessons_used: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Son Ders Tarihi</label>
                    <input
                      type="date"
                      value={updateData.last_lesson_date}
                      onChange={(e) => setUpdateData({ ...updateData, last_lesson_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notlar</label>
                    <textarea
                      value={updateData.notes}
                      onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paket hakkında notlar..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdatePackage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageManagement;