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
  HelpCircle
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

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Matematik Temelleri',
    subject: 'Matematik',
    teacher: 'Ahmet Yılmaz',
    progress: 75,
    totalLessons: 20,
    completedLessons: 15,
    nextLesson: 'Türev Uygulamaları',
    nextLessonTime: '14:00',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Mathematics%20textbook%20cover%2C%20geometric%20shapes%2C%20equations%2C%20blue%20and%20orange%20colors&image_size=landscape_4_3',
    difficulty: 'Orta'
  },
  {
    id: 2,
    title: 'Fizik Mekaniği',
    subject: 'Fizik',
    teacher: 'Mehmet Kaya',
    progress: 60,
    totalLessons: 18,
    completedLessons: 11,
    nextLesson: 'Newton Yasaları',
    nextLessonTime: '16:30',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Physics%20laboratory%20equipment%2C%20pendulum%2C%20formulas%2C%20scientific%20illustration&image_size=landscape_4_3',
    difficulty: 'Zor'
  },
  {
    id: 3,
    title: 'Kimya Temelleri',
    subject: 'Kimya',
    teacher: 'Ayşe Demir',
    progress: 90,
    totalLessons: 15,
    completedLessons: 14,
    nextLesson: 'Organik Kimya Giriş',
    nextLessonTime: '10:00',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chemistry%20laboratory%2C%20test%20tubes%2C%20molecular%20structures%2C%20colorful%20reactions&image_size=landscape_4_3',
    difficulty: 'Kolay'
  }
];

const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: 'Türev Problemleri',
    subject: 'Matematik',
    dueDate: '2024-01-25',
    status: 'pending'
  },
  {
    id: 2,
    title: 'Hareket Denklemleri',
    subject: 'Fizik',
    dueDate: '2024-01-23',
    status: 'overdue'
  },
  {
    id: 3,
    title: 'Mol Kavramı Quiz',
    subject: 'Kimya',
    dueDate: '2024-01-20',
    status: 'completed',
    score: 85
  }
];

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'İlk Ders Tamamlandı',
    description: 'İlk dersinizi başarıyla tamamladınız!',
    icon: <Play className="h-6 w-6" />,
    unlockedAt: '2024-01-15',
    points: 10
  },
  {
    id: 2,
    title: 'Matematik Ustası',
    description: '10 matematik dersi tamamladınız.',
    icon: <Award className="h-6 w-6" />,
    unlockedAt: '2024-01-20',
    points: 50
  },
  {
    id: 3,
    title: 'Haftalık Hedef',
    description: 'Bu hafta 5 saat ders çalıştınız.',
    icon: <Target className="h-6 w-6" />,
    unlockedAt: '2024-01-22',
    points: 25
  }
];

const mockStudySessions: StudySession[] = [
  { date: '2024-01-22', duration: 120, subject: 'Matematik' },
  { date: '2024-01-21', duration: 90, subject: 'Fizik' },
  { date: '2024-01-20', duration: 60, subject: 'Kimya' },
  { date: '2024-01-19', duration: 150, subject: 'Matematik' },
  { date: '2024-01-18', duration: 75, subject: 'Fizik' },
  { date: '2024-01-17', duration: 45, subject: 'Kimya' },
  { date: '2024-01-16', duration: 180, subject: 'Matematik' }
];

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
    
    // Only fetch data once when component mounts
    fetchData();
  }, []); // Remove dependencies to prevent infinite re-renders

  const totalStudyTime = mockStudySessions.reduce((total, session) => total + session.duration, 0);
  const averageScore = 87; // Mock average
  const completedCourses = mockCourses.filter(course => course.progress === 100).length;
  const totalPoints = mockAchievements.reduce((total, achievement) => total + achievement.points, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'text-green-600 bg-green-100';
      case 'Orta': return 'text-yellow-600 bg-yellow-100';
      case 'Zor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCourses = mockCourses.filter(course => {
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
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
                        onClick={() => handleSettingAction('profile')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Profil Düzenle</span>
                          <p className="text-xs text-gray-500">Kişisel bilgilerinizi güncelleyin</p>
                        </div>
                      </button>
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
                        onClick={() => handleSettingAction('account')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Hesap Ayarları</span>
                          <p className="text-xs text-gray-500">Güvenlik ve hesap yönetimi</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSettingAction('privacy')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Gizlilik</span>
                          <p className="text-xs text-gray-500">Gizlilik ve veri ayarları</p>
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
              { id: 'teachers', label: 'Öğretmen Ara', icon: Search },
              { id: 'assignments', label: 'Ödevler', icon: CheckCircle },
              { id: 'schedule', label: 'Program', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
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

                {/* Study Time Card */}
                <div className="group relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Toplam Çalışma</p>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-green-600">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((totalStudyTime / 600) * 100, 100)}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500">Hedef: 10 saat</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={handleEditProfile}
                  disabled={buttonLoading === 'edit-profile'}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {buttonLoading === 'edit-profile' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Profili Düzenle</span>
                </button>
                <button 
                  onClick={handleSecurity}
                  disabled={buttonLoading === 'security'}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {buttonLoading === 'security' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Güvenlik</span>
                </button>
                <button 
                  onClick={handleDownloadReport}
                  disabled={buttonLoading === 'download-report'}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {buttonLoading === 'download-report' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Rapor İndir</span>
                </button>
              </div>
            </div>

            {/* Recent Activity & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Courses */}
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Devam Eden Kurslar</h3>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-5">
                  {mockCourses.slice(0, 3).map((course, index) => (
                    <div key={course.id} className="group flex items-center space-x-5 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-105">
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
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

              {/* Recent Achievements */}
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Son Başarılar</h3>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-5">
                  {mockAchievements.slice(0, 3).map((achievement, index) => (
                    <div key={achievement.id} className="group flex items-center space-x-5 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 hover:scale-105">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                          {achievement.icon}
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors duration-300">{achievement.title}</h4>
                        <p className="text-gray-600 font-medium">{achievement.description}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 font-medium">Tebrikler!</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
                  <div className="relative">
                    <h2 className="text-3xl font-bold mb-2">Derslerim</h2>
                    <p className="text-blue-100 mb-6">Aktif derslerinizi takip edin ve ilerlemenizi görün</p>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{lessons.length}</div>
                        <div className="text-sm text-blue-100">Toplam Ders</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search and Filter */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ders, öğretmen veya konu ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                      />
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors min-w-[150px]"
                      >
                        <option value="all">Tüm Dersler</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Tarih">Tarih</option>
                      </select>
                      <button className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                        <Filter className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {lessons.length > 0 ? lessons.map((lesson: any) => (
                    <div key={lesson.id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500">
                      {/* Course Image/Header */}
                      <div className="relative h-56 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                          <span className={`px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-sm ${
                            lesson.status === 'completed' ? 'bg-green-500/90 text-white' :
                            lesson.status === 'scheduled' ? 'bg-blue-500/90 text-white' :
                            'bg-yellow-500/90 text-white'
                          }`}>
                            {lesson.status === 'completed' ? 'Tamamlandı' :
                             lesson.status === 'scheduled' ? 'Planlandı' : 'Beklemede'}
                          </span>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{lesson.subject}</h3>
                          <div className="flex items-center text-white/90 text-base">
                            <User className="h-5 w-5 mr-3" />
                            <span>{lesson.teacher?.user?.full_name || lesson.teacher_name}</span>
                          </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full transform -translate-x-10 translate-y-10"></div>
                      </div>

                      {/* Course Content */}
                      <div className="p-8">
                        {/* Date and Time */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-5 w-5 mr-3" />
                            <span className="text-base font-medium">
                              {new Date(lesson.date_time || lesson.scheduled_at).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-5 w-5 mr-3" />
                            <span className="text-base font-medium">
                              {new Date(lesson.date_time || lesson.scheduled_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleLessonDetails(lesson.id)}
                            disabled={buttonLoading === `lesson-${lesson.id}`}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {buttonLoading === `lesson-${lesson.id}` ? (
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            ) : (
                              <MessageSquare className="h-5 w-5 mr-3" />
                            )}
                            Detaylar
                          </button>
                          {lesson.status === 'scheduled' && (
                            <button className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:border-gray-400">
                              <Calendar className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full">
                      <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <BookOpen className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz ders kaydınız yok</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Öğretmenlerimizle tanışın ve ilk dersinizi planlayın. Öğrenme yolculuğunuz burada başlıyor!
                        </p>
                        <button 
                          onClick={() => setActiveTab('teachers')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                        >
                          Öğretmen Ara
                        </button>
                      </div>
                    </div>
                  )}
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
                <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Öğretmenlerim</h2>
                        <p className="text-gray-600 font-medium text-lg">Uzman öğretmenlerimizle tanışın ve ders planlayın</p>
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
                      className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium text-lg"
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
                        
                        <div className="relative flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{teacher.user?.full_name || teacher.full_name}</h3>
                            <p className="text-green-100 text-sm font-medium">{teacher.user?.email || teacher.email}</p>
                          </div>
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      <div className="p-8">
                        {/* Subjects */}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="mb-6">
                            <p className="text-gray-700 font-bold mb-3 flex items-center">
                              <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                              Uzmanlık Alanları:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.subjects.map((subject: string, index: number) => (
                                <span key={index} className="px-4 py-2 text-sm bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-xl font-semibold border border-green-200 hover:from-green-200 hover:to-teal-200 transition-colors duration-300">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 50) + 20}</div>
                            <div className="text-sm text-blue-600 font-medium">Tamamlanan Ders</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 5) + 3} yıl</div>
                            <div className="text-sm text-purple-600 font-medium">Deneyim</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleScheduleLesson(teacher.id)}
                            disabled={buttonLoading === `schedule-${teacher.id}`}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-2xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {buttonLoading === `schedule-${teacher.id}` ? (
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            ) : (
                              <MessageSquare className="h-5 w-5 mr-3" />
                            )}
                            Ders Planla
                          </button>
                          <button 
                            onClick={() => handleViewProfile(teacher.id)}
                            disabled={buttonLoading === `profile-${teacher.id}`}
                            className="w-full bg-white border-2 border-green-200 text-green-600 py-3 px-6 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {buttonLoading === `profile-${teacher.id}` ? (
                              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            ) : (
                              <User className="h-5 w-5 mr-3" />
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
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-2">Verilen Ödevler</h2>
                <p className="text-purple-100 mb-6">Ödevlerinizi takip edin ve zamanında teslim edin</p>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockAssignments.length}</div>
                    <div className="text-sm text-purple-100">Toplam Ödev</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockAssignments.filter(a => a.status === 'completed').length}</div>
                    <div className="text-sm text-purple-100">Tamamlanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockAssignments.filter(a => a.status === 'pending').length}</div>
                    <div className="text-sm text-purple-100">Bekleyen</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAssignments.map((assignment) => (
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
            {mockAssignments.length === 0 && (
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



        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full transform translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full transform -translate-x-16 translate-y-16"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-white/5 rounded-full"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm mr-8">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-5xl font-bold mb-3">Bu Haftaki Programım</h2>
                      <p className="text-indigo-100 text-xl">Haftalık ders programınızı takip edin ve zamanınızı planlayın</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-10">
                  <div className="text-center p-8 bg-white/20 rounded-3xl backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">{lessons.filter((lesson: any) => lesson.status === 'scheduled').length}</div>
                    <div className="text-indigo-200 text-base font-medium">Planlanmış Ders</div>
                  </div>
                  <div className="text-center p-8 bg-white/20 rounded-3xl backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">{new Set(lessons.filter((lesson: any) => lesson.status === 'scheduled').map((lesson: any) => lesson.subject)).size}</div>
                    <div className="text-indigo-200 text-base font-medium">Farklı Konu</div>
                  </div>
                  <div className="text-center p-8 bg-white/20 rounded-3xl backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">5</div>
                    <div className="text-indigo-200 text-base font-medium">Aktif Gün</div>
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
                      <div key={lesson.id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500">
                        {/* Course Header */}
                        <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                              Planlanmış Ders
                            </span>
                          </div>
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-bold text-white mb-2">{lesson.subject}</h3>
                            <div className="flex items-center text-white/90 text-base">
                              <User className="h-5 w-5 mr-3" />
                              <span className="font-medium">{lesson.teacher?.user?.full_name || lesson.teacher_name}</span>
                            </div>
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-12 -translate-y-12"></div>
                          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full transform -translate-x-10 translate-y-10"></div>
                          <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white/5 rounded-full transform -translate-y-1/2"></div>
                        </div>

                        {/* Course Content */}
                        <div className="p-8">
                          {/* Date and Time */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center text-gray-700">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Tarih</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {new Date(lesson.date_time || lesson.scheduled_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                                <Clock className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Saat</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {new Date(lesson.date_time || lesson.scheduled_at).toLocaleTimeString('tr-TR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleLessonDetails(lesson.id)}
                              disabled={buttonLoading === `lesson-${lesson.id}`}
                              className={`flex-1 bg-gradient-to-r ${gradient} text-white py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center font-semibold group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {buttonLoading === `lesson-${lesson.id}` ? (
                                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                              ) : (
                                <MessageSquare className="h-5 w-5 mr-3" />
                              )}
                              {buttonLoading === `lesson-${lesson.id}` ? 'Yükleniyor...' : 'Detaylar'}
                            </button>
                            <button className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                              <Calendar className="h-5 w-5" />
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