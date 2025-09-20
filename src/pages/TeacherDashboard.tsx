import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Bell, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye, 
  Clock, 
  Award, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Video,
  FileText,
  Upload,
  Loader2,
  Shield,
  HelpCircle,
  Palette,
  LogOut
} from 'lucide-react';
import { useTeacher } from '../hooks/useTeacher';
import { useAuth } from '../hooks/useAuth';
import { Student } from '../../shared/types';

interface LocalStudent extends Student {
  user_id: string;
  courses: number;
  averageGrade: number;
  lastActivity: string;
  totalStudyTime: number; // minutes
  status: 'active' | 'inactive';
  user?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  school_name?: string;
}

interface Course {
  id: number;
  title: string;
  subject: string;
  studentsCount: number;
  lessonsCount: number;
  averageRating: number;
  status: 'active' | 'draft' | 'completed';
  thumbnail: string;
  createdAt: string;
}

interface Lesson {
  id: number;
  title: string;
  courseId: number;
  courseName: string;
  duration: number; // minutes
  views: number;
  completionRate: number;
  scheduledAt?: string;
  status: 'published' | 'draft' | 'scheduled';
}

// Message interface removed - messages functionality removed

const mockStudents: LocalStudent[] = [
  {
    id: '1',
    user_id: 'user1',
    profile_id: 'profile1',
    courses: 3,
    averageGrade: 87,
    lastActivity: '2 saat önce',
    status: 'active',
    totalStudyTime: 1250,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      full_name: 'Elif Yılmaz',
      email: 'elif@example.com',
      avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Portrait%20of%20a%20Turkish%20female%20student%2C%20friendly%20smile%2C%20study%20environment&image_size=square'
    }
  },
  {
    id: '2',
    user_id: 'user2',
    profile_id: 'profile2',
    courses: 2,
    averageGrade: 92,
    lastActivity: '1 gün önce',
    status: 'active',
    totalStudyTime: 980,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      full_name: 'Ahmet Kaya',
      email: 'ahmet@example.com',
      avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Portrait%20of%20a%20Turkish%20male%20student%2C%20confident%20expression%2C%20books%20background&image_size=square'
    }
  },
  {
    id: '3',
    user_id: 'user3',
    profile_id: 'profile3',
    courses: 4,
    averageGrade: 78,
    lastActivity: '3 gün önce',
    status: 'inactive',
    totalStudyTime: 750,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      full_name: 'Zeynep Demir',
      email: 'zeynep@example.com',
      avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Portrait%20of%20a%20Turkish%20female%20student%2C%20cheerful%20smile%2C%20classroom%20setting&image_size=square'
    }
  }
];

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Matematik Temelleri',
    subject: 'Matematik',
    studentsCount: 45,
    lessonsCount: 20,
    averageRating: 4.8,
    status: 'active',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Mathematics%20course%20thumbnail%2C%20equations%2C%20geometric%20shapes%2C%20educational%20design&image_size=landscape_4_3',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'Fizik Mekaniği',
    subject: 'Fizik',
    studentsCount: 32,
    lessonsCount: 18,
    averageRating: 4.6,
    status: 'active',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Physics%20course%20thumbnail%2C%20mechanics%2C%20formulas%2C%20laboratory%20equipment&image_size=landscape_4_3',
    createdAt: '2024-01-10'
  },
  {
    id: 3,
    title: 'Kimya Temelleri',
    subject: 'Kimya',
    studentsCount: 28,
    lessonsCount: 15,
    averageRating: 4.9,
    status: 'draft',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chemistry%20course%20thumbnail%2C%20molecular%20structures%2C%20test%20tubes%2C%20colorful%20reactions&image_size=landscape_4_3',
    createdAt: '2024-01-20'
  }
];

const mockLessons: Lesson[] = [
  {
    id: 1,
    title: 'Türev Kavramı',
    courseId: 1,
    courseName: 'Matematik Temelleri',
    duration: 45,
    views: 234,
    completionRate: 87,
    status: 'published'
  },
  {
    id: 2,
    title: 'Newton Yasaları',
    courseId: 2,
    courseName: 'Fizik Mekaniği',
    duration: 50,
    views: 189,
    completionRate: 92,
    scheduledAt: '2024-01-25 14:00',
    status: 'scheduled'
  },
  {
    id: 3,
    title: 'Mol Kavramı',
    courseId: 3,
    courseName: 'Kimya Temelleri',
    duration: 40,
    views: 0,
    completionRate: 0,
    status: 'draft'
  }
];

// mockMessages removed - messages functionality removed

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState<LocalStudent | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  
  // Refs for dropdown management
  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    students,
    lessons,
    loading,
    getStudents,
    getLessons
  } = useTeacher();
  
  // Mock notifications for teacher
  const [notifications] = useState([
    {
      id: '1',
      title: 'Yeni Öğrenci Kaydı',
      message: 'Ahmet Yılmaz matematik kursunuza katıldı',
      time: '5 dakika önce',
      read: false,
      type: 'student',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Ders Hatırlatması',
      message: 'Yarın saat 14:00\'da Matematik dersiniz var',
      time: '2 saat önce',
      read: false,
      type: 'lesson',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Başarı Rozetiniz Hazır',
      message: 'Bu ay 50+ ders tamamladınız!',
      time: '1 gün önce',
      read: true,
      type: 'achievement',
      icon: <Award className="h-4 w-4" />
    }
  ]);
  
  useEffect(() => {
    getStudents();
    getLessons();
  }, []);

  const totalStudents = students?.length || 0;
  const activeCourses = courses?.filter(course => course.status === 'active').length || 0;
  const totalLessons = lessons?.length || 0;
  const averageRating = courses?.length > 0 ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length : 0;
  const unreadMessages = messages?.filter(msg => !msg.isRead && !msg.read).length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'inactive': case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Event handlers for header actions
  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSettings(false);
  };
  
  const handleSettings = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false);
  };
  
  const handleLogout = async () => {
    setButtonLoading('logout');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setButtonLoading(null);
    }
  };
  
  const handleSettingAction = (action: string) => {
    console.log('Setting action:', action);
    setShowSettings(false);
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    console.log('Mark notification as read:', notificationId);
  };
  
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStudents = (students || mockStudents).filter(student => {
    const matchesSearch = student.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (student as LocalStudent).status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
                    Öğretmen Paneli
                  </h1>
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Hoş geldin, {user?.full_name}!
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
                                notification.type === 'student' ? 'bg-orange-100 text-orange-600' :
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

      {/* Modern Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'students', label: 'Öğrenciler', icon: Users },
              { id: 'courses', label: 'Kurslarım', icon: BookOpen },
              { id: 'lessons', label: 'Dersler', icon: Video },
              { id: 'schedule', label: 'Program', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="font-semibold">{tab.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-xl"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Toplam Öğrenci</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || totalStudents}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Aktif Kurs</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.activeCourses || activeCourses}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Video className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Toplam Ders</p>
                        <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Ortalama Puan</p>
                        <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Students */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Son Aktif Öğrenciler</h3>
                      <Link to="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Tümünü Gör
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {(students || []).slice(0, 3).map((student) => (
                        <div key={student.id} className="flex items-center space-x-4">
                          {student.user?.avatar_url ? (
                            <img
                              src={student.user.avatar_url}
                              alt={student.user?.full_name || 'Student'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {(student.user?.full_name)?.charAt(0) || 'S'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{student.user?.full_name || 'Öğrenci'}</h4>
                            <p className="text-sm text-gray-600">Sınıf: {student.grade_level || 'Belirtilmemiş'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{student.school_name || 'Okul bilgisi yok'}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Plus className="h-8 w-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Yeni Kurs</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Video className="h-8 w-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Ders Ekle</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="h-8 w-8 text-orange-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Ödev Ver</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Rapor Al</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Öğrenciler</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Öğrenci Ekle
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Öğrenci ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              /* Students Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                    {/* Student Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      {student.user?.avatar_url ? (
                        <img
                          src={student.user.avatar_url}
                          alt={student.user?.full_name || 'Student'}
                          className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {(student.user?.full_name)?.charAt(0) || 'S'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {student.user?.full_name || 'Öğrenci'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student.user?.email || 'E-posta yok'}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                          Aktif
                        </span>
                      </div>
                    </div>

                    {/* Student Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {lessons?.filter(lesson => lesson.student_id === student.user_id).length || 0}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">Toplam Ders</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {student.grade_level || 'N/A'}
                        </div>
                        <div className="text-xs text-purple-600 font-medium mt-1">Sınıf</div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{student.school_name || 'Okul bilgisi yok'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Son aktivite: Bugün</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                        <Eye className="h-4 w-4 mr-2" />
                        Görüntüle
                      </button>
                      <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kurslarım</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Kurs
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses || mockCourses).map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {course.title?.charAt(0) || 'K'}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.title || 'Kurs Başlığı'}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description || 'Kurs açıklaması bulunmuyor.'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{course.level || 'Seviye'}</div>
                          <div className="text-xs text-gray-500">Seviye</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{course.duration || 'Süre'}</div>
                          <div className="text-xs text-gray-500">Süre</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Fiyat: {course.price ? `${course.price} TL` : 'Ücretsiz'}</span>
                        <span>{new Date(course.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Derslerim</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Ders
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              /* Lessons Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(lessons || mockLessons).map((lesson) => (
                  <div key={lesson.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lesson.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : lesson.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : lesson.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.status === 'completed' ? 'Tamamlandı' : 
                         lesson.status === 'scheduled' ? 'Planlandı' : 
                         lesson.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede'}
                      </span>
                    </div>

                    {/* Lesson Info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                        {lesson.subject || 'Ders Konusu'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Öğrenci: {lesson.students?.user?.full_name || 'Öğrenci bilgisi yok'}
                      </p>
                    </div>

                    {/* Lesson Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {lesson.duration_minutes || '60'}
                        </div>
                        <div className="text-xs text-orange-600 font-medium mt-1">Dakika</div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 text-center">
                        <div className="text-xl font-bold text-teal-600">
                          {lesson.date_time ? new Date(lesson.date_time).getDate() : 'TBD'}
                        </div>
                        <div className="text-xs text-teal-600 font-medium mt-1">Gün</div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{lesson.date_time ? new Date(lesson.date_time).toLocaleDateString('tr-TR') : 'Tarih yok'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{lesson.date_time ? new Date(lesson.date_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Saat yok'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Program</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Ders Ekle
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              /* Schedule Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(lessons || []).filter(lesson => lesson.status === 'scheduled').map((lesson) => (
                  <div key={lesson.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                    {/* Schedule Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Planlandı
                      </span>
                    </div>

                    {/* Schedule Info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">
                        {lesson.subject || 'Ders Başlığı'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Öğrenci: {lesson.students?.user?.full_name || 'Öğrenci bilgisi yok'}
                      </p>
                    </div>

                    {/* Date & Time Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{lesson.date_time ? new Date(lesson.date_time).toLocaleDateString('tr-TR') : 'Tarih yok'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{lesson.date_time ? new Date(lesson.date_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Saat yok'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{lesson.duration_minutes || '60'} dakika</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      <button className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200 shadow-sm hover:shadow-md">
                        İptal Et
                      </button>
                    </div>
                  </div>
                ))}
                {(!lessons || lessons.filter(lesson => lesson.status === 'scheduled').length === 0) && (
                  <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz planlanmış ders yok</h3>
                    <p className="text-gray-500 mb-6">Yeni bir ders planlamak için yukarıdaki butonu kullanabilirsiniz.</p>
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                      <Plus className="h-5 w-5 mr-2 inline" />
                      İlk Dersi Planla
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;