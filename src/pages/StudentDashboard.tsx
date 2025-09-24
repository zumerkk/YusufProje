import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Settings, 
  Bell, 
  Search,
  Filter,
  BarChart3,
  Target,
  Star,
  Download,
  MessageSquare,
  Loader2,
  Mail,
  GraduationCap,
  Shield,
  Users,
  FileText,
  Plus,
  Trophy,
  Zap,
  Upload,
  ChevronRight,
  Edit,
  Trash2,
  XCircle,
  Eye,
  LogOut,
  Palette,
  HelpCircle,
  Package,
  CreditCard,
  ShoppingCart
} from 'lucide-react';
import { useStudent } from '../hooks/useStudent';
import { useAuth } from '../hooks/useAuth';

interface Course {
  id: number;
  title: string;
  subject: string;
  teacher: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  nextLessonTime: string;
  thumbnail: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  score?: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: string;
  points: number;
}

interface StudySession {
  date: string;
  duration: number; // minutes
  subject: string;
}

// Grade level will be fetched from user data dynamically

const getCoursesForGrade = (grade: number): Course[] => {
  const baseCourses = [
    {
      id: 1,
      title: 'Matematik',
      subject: 'Matematik',
      teacher: 'Uzman Öğretmen',
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      nextLesson: 'Cebirsel İfadeler',
      nextLessonTime: '14:00',
      thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop&crop=center',
      difficulty: 'Orta' as const
    },
    {
      id: 2,
      title: 'Fen Bilimleri',
      subject: 'Fen Bilimleri',
      teacher: 'Uzman Öğretmen',
      progress: 60,
      totalLessons: 18,
      completedLessons: 11,
      nextLesson: 'Vücudumuzda Sistemler',
      nextLessonTime: '16:30',
      thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop&crop=center',
      difficulty: 'Orta' as const
    },
    {
      id: 3,
      title: 'Türkçe',
      subject: 'Türkçe',
      teacher: 'Uzman Öğretmen',
      progress: 85,
      totalLessons: 16,
      completedLessons: 14,
      nextLesson: 'Metin Türleri',
      nextLessonTime: '10:00',
      thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
      difficulty: 'Kolay' as const
      },
      {
        id: 5,
      title: 'Yabancı Dil (İngilizce)',
      subject: 'İngilizce',
      teacher: 'Uzman Öğretmen',
      progress: 40,
      totalLessons: 15,
      completedLessons: 6,
      nextLesson: 'Present Tense',
      nextLessonTime: '11:30',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center',
      difficulty: 'Orta' as const
    }
  ];

  // Add grade-specific courses
  if (grade === 7) {
    baseCourses.push({
      id: 4,
      title: 'Sosyal Bilgiler',
      subject: 'Sosyal Bilgiler',
      teacher: 'Uzman Öğretmen',
      progress: 55,
      totalLessons: 12,
      completedLessons: 7,
      nextLesson: 'Türk Tarihi',
      nextLessonTime: '15:00',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
      difficulty: 'Orta' as const
      });
  } else if (grade === 8) {
    // 8. sınıf için tüm dersler
    const grade8Courses = [
      {
        id: 4,
        title: 'İnkılap Tarihi ve Atatürkçülük',
        subject: 'İnkılap Tarihi ve Atatürkçülük',
        teacher: 'Uzman Öğretmen',
        progress: 55,
        totalLessons: 12,
        completedLessons: 7,
        nextLesson: 'Atatürk İlkeleri',
        nextLessonTime: '15:00',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Orta' as const
      },
      {
        id: 6,
        title: 'Sosyal Bilgiler',
        subject: 'Sosyal Bilgiler',
        teacher: 'Uzman Öğretmen',
        progress: 45,
        totalLessons: 14,
        completedLessons: 6,
        nextLesson: 'Coğrafya ve İklim',
        nextLessonTime: '13:30',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Orta' as const
      },
      {
        id: 7,
        title: 'Din Kültürü ve Ahlak Bilgisi',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        teacher: 'Uzman Öğretmen',
        progress: 65,
        totalLessons: 10,
        completedLessons: 7,
        nextLesson: 'Ahlaki Değerler',
        nextLessonTime: '09:00',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Kolay' as const
      },
      {
        id: 8,
        title: 'Beden Eğitimi',
        subject: 'Beden Eğitimi',
        teacher: 'Uzman Öğretmen',
        progress: 80,
        totalLessons: 8,
        completedLessons: 6,
        nextLesson: 'Atletizm',
        nextLessonTime: '14:30',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Kolay' as const
      },
      {
        id: 9,
        title: 'Müzik',
        subject: 'Müzik',
        teacher: 'Uzman Öğretmen',
        progress: 70,
        totalLessons: 6,
        completedLessons: 4,
        nextLesson: 'Türk Müziği',
        nextLessonTime: '11:00',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Kolay' as const
      },
      {
        id: 10,
        title: 'Görsel Sanatlar',
        subject: 'Görsel Sanatlar',
        teacher: 'Uzman Öğretmen',
        progress: 50,
        totalLessons: 8,
        completedLessons: 4,
        nextLesson: 'Resim Teknikleri',
        nextLessonTime: '16:00',
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&crop=center',
        difficulty: 'Orta' as const
      }
    ];
    
    baseCourses.push(...grade8Courses);
  }

  return baseCourses;
};

// Courses will be fetched dynamically based on user's grade level

// Assignments will be fetched from database

// Achievements will be fetched from database
const mockAchievements: Achievement[] = [];

// Study sessions will be fetched from database
const mockStudySessions: StudySession[] = [];

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  
  // Package related states
  const [studentPackages, setStudentPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { loading, teachers, lessons, searchTeachers, getLessons } = useStudent();
  const { user, logout } = useAuth();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'Yeni Ödev Atandı',
      message: 'Matematik dersi için türev problemleri ödevi atandı.',
      time: '2 saat önce',
      read: false,
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 2,
      type: 'lesson',
      title: 'Ders Hatırlatması',
      message: 'Fizik dersiniz 30 dakika sonra başlayacak.',
      time: '30 dakika önce',
      read: false,
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Yeni Rozet Kazandınız!',
      message: 'Matematik Ustası rozetini kazandınız.',
      time: '1 gün önce',
      read: true,
      icon: <Trophy className="h-4 w-4" />
    },
    {
      id: 4,
      type: 'grade',
      title: 'Not Güncellendi',
      message: 'Kimya quiz notunuz: 85/100',
      time: '2 gün önce',
      read: true,
      icon: <Star className="h-4 w-4" />
    }
  ];

  // Fetch student packages on component mount
  useEffect(() => {
    const fetchStudentPackages = async () => {
      if (!user) return;
      
      setPackagesLoading(true);
      try {
        const response = await fetch('/api/student/packages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudentPackages(data.packages || []);
          setPaymentHistory(data.paymentHistory || []);
        }
      } catch (error) {
        console.error('Error fetching student packages:', error);
        toast.error('Paket bilgileri yüklenirken hata oluştu.');
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchStudentPackages();
  }, [user]);

  // Fetch available packages
  useEffect(() => {
    const fetchAvailablePackages = async () => {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const data = await response.json();
          setAvailablePackages(data.packages || []);
        }
      } catch (error) {
        console.error('Error fetching available packages:', error);
      }
    };

    fetchAvailablePackages();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Button handler functions
  const handleEditProfile = async () => {
    setButtonLoading('edit-profile');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Profil düzenleme sayfasına yönlendiriliyorsunuz...');
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleSecurity = async () => {
    setButtonLoading('security');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Güvenlik ayarları açılıyor...');
    } catch (error) {
      toast.error('Güvenlik ayarlarına erişilemedi.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleDownloadReport = async () => {
    setButtonLoading('download-report');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API call
      toast.success('Rapor başarıyla indirildi!');
    } catch (error) {
      toast.error('Rapor indirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleScheduleLesson = async (teacherId: number) => {
    setButtonLoading(`schedule-${teacherId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Ders planlaması başlatıldı!');
    } catch (error) {
      toast.error('Ders planlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleViewProfile = async (teacherId: number) => {
    setButtonLoading(`profile-${teacherId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock API call
      toast.success('Öğretmen profili açılıyor...');
    } catch (error) {
      toast.error('Profil görüntülenemedi.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleLessonDetails = async (lessonId: number) => {
    setButtonLoading(`lesson-${lessonId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock API call
      toast.success('Ders detayları açılıyor...');
    } catch (error) {
      toast.error('Ders detayları yüklenemedi.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleUploadAssignment = async (assignmentId: number) => {
    setButtonLoading(`upload-${assignmentId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Mock API call
      toast.success('Ödev yükleme sayfası açılıyor...');
    } catch (error) {
      toast.error('Ödev yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleSearchTeachers = async () => {
    setButtonLoading('search-teachers');
    try {
      await searchTeachers();
      toast.success('Öğretmen araması başlatıldı!');
    } catch (error) {
      toast.error('Öğretmen araması yapılamadı.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleLogout = async () => {
    setButtonLoading('logout');
    try {
      await logout();
      toast.success('Başarıyla çıkış yapıldı. Yönlendiriliyorsunuz...');
      // Navigate to login page after successful logout
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu.');
    } finally {
      setButtonLoading(null);
    }
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSettings(false); // Close settings if open
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false); // Close notifications if open
  };

  const markNotificationAsRead = (notificationId: number) => {
    toast.success('Bildirim okundu olarak işaretlendi');
  };

  const handleSettingAction = (action: string) => {
    setShowSettings(false);
    switch (action) {
      case 'profile':
        toast.info('Profil düzenleme sayfasına yönlendiriliyorsunuz...');
        break;
      case 'notifications':
        toast.info('Bildirim ayarları açılıyor...');
        break;
      case 'theme':
        toast.info('Tema ayarları açılıyor...');
        break;
      case 'account':
        toast.info('Hesap ayarları açılıyor...');
        break;
      case 'privacy':
        toast.info('Gizlilik ayarları açılıyor...');
        break;
      case 'help':
        toast.info('Yardım merkezi açılıyor...');
        break;
      default:
        break;
    }
  };

  // Mock Package purchase handler (without real payment integration)
  const handlePurchasePackage = async (packageId: number, installments: number = 1) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }

    setButtonLoading(`purchase-${packageId}`);
    try {
      // Mock payment process - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment response
      const mockPaymentData = {
        success: true,
        payment: {
          id: `mock_payment_${Date.now()}`,
          status: 'completed',
          amount: 299900, // Mock amount in kuruş
          installmentCount: installments,
          paymentMethod: 'mock_payment'
        },
        studentPackage: {
          id: `mock_package_${Date.now()}`,
          packageName: 'Yıllık Premium Paket',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        mockPayment: true,
        message: 'Mock ödeme başarıyla tamamlandı!'
      };

      // Simulate successful payment
      toast.success('🎉 Paket satın alımı başarıyla tamamlandı! (Mock Ödeme)');
      toast.info('💡 Bu bir demo ödeme işlemidir. Gerçek ödeme entegrasyonu devre dışı.');
      
      // Refresh packages data
      // Mock packages will be loaded automatically
      
    } catch (error) {
      console.error('Mock payment error:', error);
      toast.error('Mock ödeme işlemi sırasında hata oluştu.');
    } finally {
      setButtonLoading(null);
    }
  };

  // Load courses based on user's grade level
  useEffect(() => {
    console.log('User data in StudentDashboard:', user);
    console.log('User grade_level:', user?.grade_level);
    
    if (user && user.grade_level) {
      const gradeNumber = Number(user.grade_level);
      const userCourses = getCoursesForGrade(gradeNumber);
      setCourses(userCourses);
    } else {
      console.log('User or grade_level not available:', { user: !!user, grade_level: user?.grade_level });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers and lessons in parallel
        const [teachersResult, lessonsResult] = await Promise.all([
          searchTeachers(),
          getLessons()
        ]);
        
        console.log('Data fetched successfully:', { teachersResult, lessonsResult });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // Initial data fetch
    fetchData();
    
    // Set up polling for real-time updates every 30 seconds
    const pollInterval = setInterval(() => {
      getLessons(); // Refresh lessons data
    }, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []); // Remove dependencies to prevent infinite re-renders
  
  // Add effect to refresh lessons when activeTab changes to schedule
  useEffect(() => {
    if (activeTab === 'schedule') {
      getLessons();
    }
  }, [activeTab, getLessons]);

  const totalStudyTime = mockStudySessions.reduce((total, session) => total + session.duration, 0);
  const averageScore = 87; // Mock average
  const completedCourses = courses.filter(course => course.progress === 100).length;
  const totalPoints = mockAchievements.reduce((total, achievement) => total + achievement.points, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };



  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || course.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });
  
  const filteredTeachers = teachers.filter((teacher: any) => {
    const matchesSearch = teacher.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects?.some((subject: string) => 
                           subject.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Search teachers when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchTeachers(searchTerm);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, searchTeachers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Section - Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Link 
                  to="/" 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <img 
                    src="/src/assets/logo-icon.png" 
                    alt="Ders Atlası Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Öğrenci Paneli
                  </h1>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Hoş geldin, {user?.full_name || 'Demo Student'}!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Actions & Profile */}
            <div className="flex items-center space-x-3">
              {/* Notifications Button */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={handleNotifications}
                  title="Bildirimler"
                  className={`relative p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showNotifications 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
                      <p className="text-sm text-gray-600 mt-1">{notifications.filter(n => !n.read).length} okunmamış bildirim</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">Henüz bildirim yok</p>
                          <p className="text-sm mt-1">Yeni bildirimler burada görünecek</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-xl ${
                                notification.type === 'assignment' ? 'bg-orange-100 text-orange-600' :
                                notification.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {notification.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded-lg transition-colors">
                        Tüm bildirimleri görüntüle
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings Button */}
              <div className="relative" ref={settingsRef}>
                <button 
                  onClick={handleSettings}
                  title="Ayarlar"
                  className={`p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showSettings 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Ayarlar</h3>
                      <p className="text-sm text-gray-600 mt-1">Hesap ve uygulama ayarları</p>
                    </div>
                    <div className="py-2">

                      <button
                        onClick={() => handleSettingAction('notifications')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Bildirim Ayarları</span>
                          <p className="text-xs text-gray-500">Bildirim tercihlerinizi yönetin</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSettingAction('theme')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Palette className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Tema Ayarları</span>
                          <p className="text-xs text-gray-500">Görünüm ve tema seçenekleri</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSettingAction('help')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Yardım</span>
                          <p className="text-xs text-gray-500">Destek ve yardım merkezi</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                disabled={buttonLoading === 'logout'}
                title="Çıkış Yap"
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonLoading === 'logout' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </button>

              {/* Profile Avatar */}
              <div className="relative ml-3 pl-3 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-1">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'courses', label: 'Derslerim', icon: BookOpen },
              { id: 'assignments', label: 'Ödevler', icon: CheckCircle },
              { id: 'packages', label: 'Paketlerim', icon: Package, isLink: true, path: '/student/packages' },
              { id: 'schedule', label: 'Program', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              
              if (tab.isLink) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Account Information Card - Modern Design */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
              
              {/* Header with Avatar */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Hesap Bilgileri</h3>
                    <p className="text-sm text-gray-600 mt-1">Profil ve hesap detayları</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Name Card */}
                <div className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ad-Soyad</p>
                  <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{user?.full_name || 'Demo Student'}</p>
                </div>

                {/* Email Card */}
                <div className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
                  <p className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 truncate">{user?.email || 'student@example.com'}</p>
                </div>

                {/* Account Type Card */}
                <div className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hesap Türü</p>
                  <div className="flex items-center space-x-2">
                        <p className="text-lg font-bold text-indigo-600">Öğrenci</p>
                        <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">PRO</div>
                      </div>
                </div>

                {/* Class Level Card */}
                <div className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sınıf Seviyesi</p>
                  <p className="text-lg font-bold text-green-600">{user?.grade_level ? `${user.grade_level}. Sınıf` : 'Belirtilmemiş'}</p>
                </div>
              </div>

              {/* Quick Actions kaldırıldı */}
            </div>

            {/* Recent Activity & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Courses */}
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Devam Eden Dersler</h3>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-5">
                  {courses.slice(0, 5).map((course, index) => (
                    <div key={course.id} className="group flex items-center space-x-5 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-105">
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">{course.title}</h4>
                        <p className="text-gray-600 font-medium">{course.subject}</p>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Lessons - Empty State */}
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Tamamlanmış Dersler</h3>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-center font-medium">Henüz tamamlanmış ders bulunmuyor</p>
                  <p className="text-gray-400 text-center text-sm mt-2">Derslerinizi tamamladıkça burada görünecek</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Dersler yükleniyor...</span>
              </div>
            ) : (
              <>
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
                  <div className="relative">
                    <h2 className="text-2xl font-bold mb-2">Derslerim</h2>
                    <p className="text-blue-100 mb-4">Aktif derslerinizi takip edin ve ilerlemenizi görün</p>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl font-bold">{courses.length}</div>
                        <div className="text-sm text-blue-100">Toplam Ders</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search and Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ders, öğretmen veya konu ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors min-w-[130px] text-sm"
                      >
                        <option value="all">Tüm Dersler</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.subject}>{course.subject}</option>
                        ))}
                      </select>
                      <button className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                        <Filter className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.map((course) => (
                    <div key={course.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      {/* Course Image/Header */}
                      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-base font-bold text-white mb-1">{course.title}</h3>
                          <div className="flex items-center text-white/90 text-sm">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            <span>{course.teacher}</span>
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-4">


                        {/* Next Lesson */}
                        <div className="mb-3">
                          <div className="flex items-center text-gray-600 mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Sonraki Ders</span>
                          </div>
                          <p className="text-xs text-gray-800 font-semibold">{course.nextLesson}</p>
                          <p className="text-xs text-gray-500">{course.nextLessonTime}</p>
                        </div>

                        {/* Action Button */}
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:shadow-lg">
                          Derse Devam Et
                        </button>
                      </div>
                    </div>
                  ))}
                </div>


              </>
            )}
          </div>
        )}
        
        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <span className="text-xl font-semibold text-gray-700">Öğretmenler yükleniyor...</span>
                  <p className="text-gray-500 mt-2">En iyi öğretmenlerimizi sizin için hazırlıyoruz</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Öğretmenlerim</h2>
                        <p className="text-gray-600 font-medium text-base">Uzman öğretmenlerimizle tanışın ve ders planlayın</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Search */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-green-500 transition-colors duration-300" />
                    <input
                      type="text"
                      placeholder="Öğretmen adı, uzmanlık alanı veya konu ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium text-base"
                    />
                  </div>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTeachers.length > 0 ? filteredTeachers.map((teacher: any, index: number) => (
                    <div key={teacher.id} className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500">
                      {/* Teacher Header */}
                      <div className="relative p-8 bg-gradient-to-br from-green-500 to-teal-600 text-white">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-10 -translate-y-10"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full transform -translate-x-8 translate-y-8"></div>
                        
                        <div className="relative flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{teacher.user?.full_name || teacher.full_name}</h3>
                            <p className="text-green-100 text-xs font-medium">{teacher.user?.email || teacher.email}</p>
                          </div>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Rating Stars */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-300 fill-current' : 'text-white/30'}`} />
                            ))}
                          </div>
                          <span className="text-white/90 text-sm font-medium">4.8 (127 değerlendirme)</span>
                        </div>
                      </div>

                      {/* Teacher Content */}
                      <div className="p-6">
                        {/* Subjects */}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="mb-4">
                            <p className="text-gray-700 font-bold mb-2 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                              Uzmanlık Alanları:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.subjects.map((subject: string, index: number) => (
                                <span key={index} className="px-3 py-1 text-xs bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-lg font-semibold border border-green-200 hover:from-green-200 hover:to-teal-200 transition-colors duration-300">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="text-lg font-bold text-blue-600">{Math.floor(Math.random() * 50) + 20}</div>
                            <div className="text-xs text-blue-600 font-medium">Tamamlanan Ders</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                            <div className="text-lg font-bold text-purple-600">{Math.floor(Math.random() * 5) + 3} yıl</div>
                            <div className="text-xs text-purple-600 font-medium">Deneyim</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleScheduleLesson(teacher.id)}
                            disabled={buttonLoading === `schedule-${teacher.id}`}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {buttonLoading === `schedule-${teacher.id}` ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4 mr-2" />
                            )}
                            Ders Planla
                          </button>
                          <button 
                            onClick={() => handleViewProfile(teacher.id)}
                            disabled={buttonLoading === `profile-${teacher.id}`}
                            className="w-full bg-white border-2 border-green-200 text-green-600 py-2 px-4 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {buttonLoading === `profile-${teacher.id}` ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <User className="h-4 w-4 mr-2" />
                            )}
                            Profili Görüntüle
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full">
                      <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl border-2 border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="h-10 w-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Öğretmen bulunamadı</h3>
                        <p className="text-gray-600 text-lg max-w-md mx-auto">
                          Arama kriterlerinizi değiştirerek tekrar deneyin veya tüm öğretmenleri görüntüleyin.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full transform -translate-x-10 translate-y-10"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold mb-2">Verilen Ödevler</h2>
                <p className="text-purple-100 mb-4">Ödevlerinizi takip edin ve zamanında teslim edin</p>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-sm text-purple-100">Toplam Ödev</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-sm text-purple-100">Tamamlanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-sm text-purple-100">Bekleyen</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[].map((assignment) => (
                <div key={assignment.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  {/* Assignment Header */}
                  <div className={`relative p-6 ${
                    assignment.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    assignment.status === 'overdue' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {assignment.status === 'completed' ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : assignment.status === 'overdue' ? (
                          <AlertCircle className="h-6 w-6 text-white" />
                        ) : (
                          <Clock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        assignment.status === 'completed' ? 'bg-green-500/30 text-white' :
                        assignment.status === 'overdue' ? 'bg-red-500/30 text-white' :
                        'bg-blue-500/30 text-white'
                      }`}>
                        {assignment.status === 'completed' ? 'Tamamlandı' :
                         assignment.status === 'overdue' ? 'Gecikmiş' : 'Beklemede'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                    <p className="text-white/90 text-sm">{assignment.subject}</p>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-10 -translate-y-10"></div>
                  </div>

                  {/* Assignment Content */}
                  <div className="p-6">
                    {/* Due Date */}
                    <div className="flex items-center mb-4 text-gray-600">
                      <Calendar className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">Teslim: {assignment.dueDate}</span>
                    </div>

                    {/* Score Display */}
                    {assignment.score && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700">Notunuz</span>
                          <span className="text-2xl font-bold text-green-600">{assignment.score}/100</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${assignment.score}%`}}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    {assignment.status !== 'completed' && (
                      <button 
                        onClick={() => handleUploadAssignment(assignment.id)}
                        disabled={buttonLoading === `upload-${assignment.id}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {buttonLoading === `upload-${assignment.id}` ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5 mr-2" />
                        )}
                        {buttonLoading === `upload-${assignment.id}` ? 'Yükleniyor...' : 'Ödev Yükle'}
                      </button>
                    )}

                    {assignment.status === 'completed' && (
                      <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl flex items-center justify-center font-semibold">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Teslim Edildi
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {true && (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz ödev bulunmuyor</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Öğretmenleriniz size ödev verdiğinde burada görünecek.
                </p>
              </div>
            )}
          </div>
        )}



        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Paketlerim</h2>
                      <p className="text-emerald-100 text-sm">Aktif paketlerinizi yönetin ve yeni paketler keşfedin</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">{studentPackages.length}</div>
                    <div className="text-emerald-200 text-xs font-medium">Aktif Paket</div>
                  </div>
                  <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">
                      {studentPackages.reduce((total: number, pkg: any) => total + (pkg.remaining_lessons || 0), 0)}
                    </div>
                    <div className="text-emerald-200 text-xs font-medium">Kalan Ders</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Packages */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Aktif Paketlerim</h3>
                <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Yeni Paket Satın Al</span>
                </button>
              </div>

              {packagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {studentPackages.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz aktif paketiniz bulunmuyor</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Eğitim paketleri satın alarak derslerinize başlayabilirsiniz.
                      </p>
                      <button 
                        onClick={() => navigate('/packages')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium"
                      >
                        Paketleri İncele
                      </button>
                    </div>
                  ) : (
                    studentPackages.map((pkg: any, index: number) => {
                      const progressPercentage = pkg.total_lessons > 0 ? 
                        ((pkg.total_lessons - pkg.remaining_lessons) / pkg.total_lessons) * 100 : 0;
                      const gradients = [
                        'from-blue-500 to-purple-600',
                        'from-emerald-500 to-teal-600',
                        'from-orange-500 to-red-600',
                        'from-indigo-500 to-purple-600'
                      ];
                      const gradient = gradients[index % gradients.length];
                      
                      return (
                        <div key={pkg.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                          <div className={`relative h-32 bg-gradient-to-br ${gradient} overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <GraduationCap className="h-4 w-4 text-white" />
                              </div>
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                                {pkg.status === 'active' ? 'Aktif' : pkg.status}
                              </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h4 className="text-xl font-bold text-white mb-1">{pkg.package_name}</h4>
                              <p className="text-white/90 text-sm">{pkg.package_description}</p>
                            </div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-10 -translate-y-10"></div>
                          </div>

                          <div className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Kalan Ders</p>
                                    <p className="text-lg font-bold text-gray-900">{pkg.remaining_lessons} / {pkg.total_lessons}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">Son Kullanım</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {pkg.expires_at ? new Date(pkg.expires_at).toLocaleDateString('tr-TR') : 'Süresiz'}
                                  </p>
                                </div>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-500`} style={{width: `${progressPercentage}%`}}></div>
                              </div>

                              <div className="flex gap-3">
                                <button className={`flex-1 bg-gradient-to-r ${gradient} text-white py-3 px-4 rounded-xl hover:opacity-90 transition-all duration-300 font-medium flex items-center justify-center`}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Derse Devam Et
                                </button>
                                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Available Packages */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Satın Alabileceğiniz Paketler</h3>
                <Link to="/packages" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1">
                  <span>Tümünü Gör</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {packagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePackages.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz paket bulunmuyor</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Yakında yeni eğitim paketleri eklenecek.
                      </p>
                    </div>
                  ) : (
                    availablePackages.slice(0, 3).map((pkg: any, index: number) => {
                      const gradients = [
                        'from-orange-500 to-red-600',
                        'from-indigo-500 to-purple-600',
                        'from-pink-500 to-rose-600',
                        'from-emerald-500 to-teal-600'
                      ];
                      const gradient = gradients[index % gradients.length];
                      const icons = [Trophy, Zap, Award, Star];
                      const IconComponent = icons[index % icons.length];
                      const badges = ['Popüler', 'Yeni', 'İndirim', 'Önerilen'];
                      const badgeColors = [
                        'bg-yellow-400 text-yellow-900',
                        'bg-blue-400 text-blue-900',
                        'bg-green-400 text-green-900',
                        'bg-purple-400 text-purple-900'
                      ];
                      
                      return (
                        <div key={pkg.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                          <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute top-4 left-4 right-4">
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                  <IconComponent className="h-4 w-4 text-white" />
                                </div>
                                {pkg.is_popular && (
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeColors[index % badgeColors.length]}`}>
                                    {badges[index % badges.length]}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xl font-bold text-white mb-1">{pkg.name}</h4>
                              <p className="text-white/90 text-sm">{pkg.description}</p>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between">
                                <div className="text-white">
                                  <span className="text-2xl font-bold">₺{pkg.price}</span>
                                  {pkg.original_price && pkg.original_price > pkg.price && (
                                    <span className="text-white/70 text-sm ml-1 line-through">₺{pkg.original_price}</span>
                                  )}
                                </div>
                                <div className="text-white/90 text-sm">
                                  <Star className="h-4 w-4 inline fill-current" />
                                  <span className="ml-1">{pkg.rating || '4.8'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Ders Sayısı:</span>
                                <span className="font-semibold text-gray-900">{pkg.lesson_count} Ders</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Geçerlilik:</span>
                                <span className="font-semibold text-gray-900">{pkg.validity_months} Ay</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Seviye:</span>
                                <span className="font-semibold text-gray-900">{pkg.grade_level}. Sınıf</span>
                              </div>

                              <button 
                                onClick={() => handlePurchasePackage(pkg.id)}
                                className={`w-full bg-gradient-to-r ${gradient} text-white py-3 px-4 rounded-xl hover:opacity-90 transition-all duration-300 font-medium flex items-center justify-center`}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Satın Al
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Ödeme Geçmişi</h3>
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  {packagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Henüz ödeme geçmişi bulunmuyor</h4>
                          <p className="text-gray-600">İlk paket satın alımınızdan sonra ödeme geçmişiniz burada görünecek.</p>
                        </div>
                      ) : (
                        paymentHistory.map((payment: any, index: number) => {
                          const statusColors = {
                            'completed': 'bg-green-100 text-green-800',
                            'pending': 'bg-yellow-100 text-yellow-800',
                            'failed': 'bg-red-100 text-red-800',
                            'cancelled': 'bg-gray-100 text-gray-800'
                          };
                          const iconColors = {
                            'completed': 'bg-green-100 text-green-600',
                            'pending': 'bg-yellow-100 text-yellow-600',
                            'failed': 'bg-red-100 text-red-600',
                            'cancelled': 'bg-gray-100 text-gray-600'
                          };
                          const statusText = {
                            'completed': 'Tamamlandı',
                            'pending': 'Beklemede',
                            'failed': 'Başarısız',
                            'cancelled': 'İptal Edildi'
                          };
                          
                          return (
                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[payment.status] || iconColors.completed}`}>
                                  <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{payment.package_name || 'Paket Satın Alımı'}</h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(payment.created_at).toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })} - {payment.payment_method || 'Kredi Kartı'}
                                  </p>
                                  {payment.installments && payment.installments > 1 && (
                                    <p className="text-xs text-blue-600 font-medium">
                                      {payment.installments} Taksit
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">₺{payment.amount}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || statusColors.completed}`}>
                                  {statusText[payment.status] || statusText.completed}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full transform -translate-x-10 translate-y-10"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/4 left-1/3 w-10 h-10 bg-white/5 rounded-full"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Bu Haftaki Programım</h2>
                      <p className="text-indigo-100 text-sm">Haftalık ders programınızı takip edin ve zamanınızı planlayın</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="text-xl font-bold mb-1">{lessons.filter((lesson: any) => lesson.status === 'scheduled').length}</div>
                    <div className="text-indigo-200 text-xs font-medium">Planlanmış Ders</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="text-xl font-bold mb-1">{new Set(lessons.filter((lesson: any) => lesson.status === 'scheduled').map((lesson: any) => lesson.subject)).size}</div>
                    <div className="text-indigo-200 text-xs font-medium">Farklı Konu</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="text-xl font-bold mb-1">5</div>
                    <div className="text-indigo-200 text-xs font-medium">Aktif Gün</div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Program yükleniyor...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lessons.filter((lesson: any) => lesson.status === 'scheduled').length > 0 ? 
                  lessons.filter((lesson: any) => lesson.status === 'scheduled').map((lesson: any, index: number) => {
                    const gradients = [
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-green-500 to-emerald-500',
                      'from-orange-500 to-red-500',
                      'from-indigo-500 to-purple-500',
                      'from-teal-500 to-blue-500'
                    ];
                    const gradient = gradients[index % gradients.length];
                    
                    return (
                      <div key={lesson.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300">
                        {/* Course Header */}
                        <div className={`relative h-24 bg-gradient-to-br ${gradient} overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <BookOpen className="h-3 w-3 text-white" />
                            </div>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                              Planlanmış Ders
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-base font-bold text-white mb-1">{lesson.subject}</h3>
                            <div className="flex items-center text-white/90 text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              <span className="font-medium">Uzman Öğretmen</span>
                            </div>
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-6 translate-y-6"></div>
                          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white/5 rounded-full transform -translate-y-1/2"></div>
                        </div>

                        {/* Course Content */}
                        <div className="p-4">
                          {/* Date and Time */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-gray-700">
                              <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center mr-2">
                                <Calendar className="h-3 w-3 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Tarih</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {new Date(lesson.date_time || lesson.scheduled_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center mr-2">
                                <Clock className="h-3 w-3 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Saat</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {new Date(lesson.date_time || lesson.scheduled_at).toLocaleTimeString('tr-TR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleLessonDetails(lesson.id)}
                              disabled={buttonLoading === `lesson-${lesson.id}`}
                              className={`flex-1 bg-gradient-to-r ${gradient} text-white py-2 px-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center font-semibold group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {buttonLoading === `lesson-${lesson.id}` ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              )}
                              {buttonLoading === `lesson-${lesson.id}` ? 'Yükleniyor...' : 'Detaylar'}
                            </button>
                            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                              <Calendar className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full">
                      <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Bu hafta planlanmış ders bulunmuyor</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                          Öğretmenlerinizle iletişime geçerek yeni dersler planlayabilirsiniz.
                        </p>
                        <button 
                          onClick={() => setActiveTab('teachers')}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium"
                        >
                          Öğretmen Ara
                        </button>
                      </div>
                    </div>
                  )
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;