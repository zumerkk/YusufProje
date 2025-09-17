import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Loader2
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

interface Message {
  id: number;
  studentName: string;
  studentAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
}

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

const mockMessages: Message[] = [
  {
    id: 1,
    studentName: 'Elif Yılmaz',
    studentAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Portrait%20of%20a%20Turkish%20female%20student%2C%20friendly%20smile&image_size=square',
    subject: 'Türev konusunda yardım',
    preview: 'Merhaba hocam, türev konusunda bazı sorularım var...',
    timestamp: '2 saat önce',
    isRead: false
  },
  {
    id: 2,
    studentName: 'Ahmet Kaya',
    studentAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Portrait%20of%20a%20Turkish%20male%20student%2C%20confident%20expression&image_size=square',
    subject: 'Ödev teslimi',
    preview: 'Hocam, ödevimi teslim ettim. İncelemenizi rica ederim.',
    timestamp: '1 gün önce',
    isRead: true
  }
];

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  
  const { user } = useAuth();
  const {
    students,
    lessons,
    loading,
    getStudents,
    getLessons
  } = useTeacher();
  
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

  const filteredStudents = (students || mockStudents).filter(student => {
    const matchesSearch = student.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (student as LocalStudent).status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğretmen Paneli</h1>
              <p className="text-gray-600">
                Hoş geldiniz, {user?.full_name}! Öğrencilerinizin durumunu kontrol edin.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.full_name?.split(' ').map(name => name.charAt(0)).join('').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'students', label: 'Öğrenciler', icon: Users },
              { id: 'courses', label: 'Kurslarım', icon: BookOpen },
              { id: 'lessons', label: 'Dersler', icon: Video },
              { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
              { id: 'schedule', label: 'Program', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  {tab.id === 'messages' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
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
              /* Students Table */
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Öğrenci
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          E-posta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kurslar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ortalama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Çalışma Süresi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Son Aktivite
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
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
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.user?.full_name || 'Öğrenci'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.user?.email || 'E-posta yok'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lessons?.filter(lesson => lesson.student_id === student.user_id).length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.grade_level || 'Belirtilmemiş'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.school_name || 'Okul bilgisi yok'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Son ders tarihi
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aktif
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ders Adı
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kurs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Süre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Öğrenci
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tarih
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(lessons || mockLessons).map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{lesson.subject || 'Ders Konusu'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Konu: {lesson.subject || 'Konu bilgisi yok'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.duration_minutes || 'Belirtilmemiş'} dk
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.students?.user?.full_name || 'Öğrenci bilgisi yok'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.date_time ? new Date(lesson.date_time).toLocaleDateString('tr-TR') : 'Tarih yok'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mesajlar</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Yeni Mesaj
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-200">
                {(messages || mockMessages).map((message) => (
                  <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {message.studentAvatar || message.sender?.avatar ? (
                        <img
                          src={message.studentAvatar || message.sender?.avatar}
                          alt={message.studentName || `${message.sender?.firstName} ${message.sender?.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(message.studentName || message.sender?.firstName)?.charAt(0)}
                            {(message.sender?.lastName)?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {message.studentName || `${message.sender?.firstName} ${message.sender?.lastName}`}
                            </h3>
                            <p className="text-sm text-gray-600">{message.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {message.timestamp ? new Date(message.timestamp).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            </span>
                            {!message.read && !message.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700">{message.preview || message.content}</p>
                        <div className="mt-4 flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Yanıtla
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Arşivle
                          </button>
                        </div>
                      </div>
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
              /* Schedule List */
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {(lessons || []).filter(lesson => lesson.status === 'scheduled').map((lesson) => (
                    <div key={lesson.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{lesson.subject || 'Ders Başlığı'}</h3>
                            <p className="text-sm text-gray-600">Konu: {lesson.subject || 'Konu bilgisi yok'}</p>
                            <p className="text-sm text-gray-600">Öğrenci: {lesson.students?.user?.full_name || 'Öğrenci bilgisi yok'}</p>
                            <p className="text-sm text-gray-500">
                              {lesson.date_time ? new Date(lesson.date_time).toLocaleDateString('tr-TR') : 'Tarih yok'} - 
                              {lesson.date_time ? new Date(lesson.date_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Saat yok'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Düzenle
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            İptal Et
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!lessons || lessons.filter(lesson => lesson.status === 'scheduled').length === 0) && (
                    <div className="p-6 text-center text-gray-500">
                      Henüz planlanmış ders bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;