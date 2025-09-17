import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
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
  Shield,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  MoreVertical,
  Database,
  Globe,
  Zap
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  coursesCount?: number;
  studentsCount?: number;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  studentsCount: number;
  revenue: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

interface SystemMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'user_registration' | 'course_creation' | 'payment' | 'support_ticket';
  description: string;
  timestamp: string;
  user: string;
}

// Mock users removed - now using backend data

// Mock courses removed - now using backend data

// System metrics removed - now using backend analytics data

// Recent activities removed - now using backend data

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  const { user } = useAuth();
  const { 
    users, 
    analytics, 
    loading, 
    getUsers, 
    getAnalytics
  } = useAdmin();
  
  // Extract systemStats from analytics for easier access
  const systemStats = analytics?.systemStats || {};
  
  useEffect(() => {
    getUsers();
    getAnalytics();
    // TODO: Fetch courses and activities from backend
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'teacher': return 'text-blue-600 bg-blue-100';
      case 'student': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return UserCheck;
      case 'course_creation': return BookOpen;
      case 'payment': return DollarSign;
      case 'support_ticket': return MessageSquare;
      default: return Activity;
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const fullName = user.full_name || '';
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.role === selectedFilter || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
              <p className="text-gray-600">Hoş geldiniz, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
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
              { id: 'users', label: 'Kullanıcılar', icon: Users },
              { id: 'courses', label: 'Kurslar', icon: BookOpen },
              { id: 'analytics', label: 'Analitik', icon: TrendingUp },
              { id: 'finance', label: 'Finans', icon: DollarSign },
              { id: 'system', label: 'Sistem', icon: Database },
              { id: 'settings', label: 'Ayarlar', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
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
                {/* System Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.userStats?.total || 0}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm ml-1 text-green-600">+{analytics?.userStats?.recentSignups || 0} yeni</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Toplam Dersler</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.lessonStats?.totalLessons || 0}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm ml-1 text-green-600">+{analytics?.lessonStats?.completedLessons || 0} tamamlandı</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Toplam Gelir</p>
                        <p className="text-2xl font-bold text-gray-900">₺{(analytics?.systemStats?.totalRevenue || 0).toLocaleString()}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm ml-1 text-green-600">Bu ay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Activity className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600">Aktif Kullanıcılar</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.systemStats?.activeUsers || 0}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm ml-1 text-green-600">Son 30 gün</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Son Aktiviteler</h3>
                  <Link to="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Tümünü Gör
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.user}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-gray-500 text-center py-4">Henüz aktivite bulunmuyor</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Hızlı İstatistikler</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Yeni Kayıtlar</span>
                    <span className="font-bold text-gray-900">{analytics?.userStats?.recentSignups || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Öğretmenler</span>
                    <span className="font-bold text-gray-900">{analytics?.userStats?.byRole?.teacher || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tamamlanan Dersler</span>
                    <span className="font-bold text-gray-900">{analytics?.lessonStats?.completedLessons || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ortalama Puan</span>
                    <span className="font-bold text-gray-900">{analytics?.teacherStats?.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Öğrenciler</span>
                    <span className="font-bold text-green-600">{analytics?.userStats?.byRole?.student || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">En Popüler Kurslar</h3>
                <Link to="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Tümünü Gör
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Kurs</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Öğretmen</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Öğrenci</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Gelir</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length > 0 ? courses.slice(0, 3).map((course) => (
                      <tr key={course.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{course.title}</td>
                        <td className="py-3 px-4 text-gray-600">{course.teacher?.user?.full_name || 'Bilinmiyor'}</td>
                        <td className="py-3 px-4 text-gray-600">{course.student_count || 0}</td>
                        <td className="py-3 px-4 text-gray-600">₺{(course.price || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-600">{course.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Henüz kurs bulunmuyor
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tüm Kullanıcılar</option>
                <option value="student">Öğrenciler</option>
                <option value="teacher">Öğretmenler</option>
                <option value="admin">Yöneticiler</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="suspended">Askıya Alınmış</option>
              </select>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Kullanıcı
              </button>
            </div>

            {/* Users Table */}
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
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Katılım Tarihi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Son Giriş
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İstatistik
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {false ? (
                                <img
                                  src=""
                                  alt={user.full_name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                  {user.full_name?.[0] || 'U'}{user.full_name?.split(' ')[1]?.[0] || ''}
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role === 'student' ? 'Öğrenci' : 
                               user.role === 'teacher' ? 'Öğretmen' : 'Yönetici'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status === 'active' ? 'Aktif' : 
                               user.status === 'inactive' ? 'Pasif' : 'Askıya Alınmış'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString('tr-TR') : 'Hiç giriş yapmamış'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.role === 'teacher' ? (
                              <div>
                                <div>{user.courseCount || 0} kurs</div>
                                <div className="text-gray-500">{user.studentCount || 0} öğrenci</div>
                              </div>
                            ) : user.role === 'student' ? (
                              <div>{user.enrollmentCount || 0} kayıt</div>
                            ) : (
                              <span className="text-gray-400">Yönetici</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <UserX className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            {searchTerm || selectedFilter !== 'all' ? 'Arama kriterlerine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
                          </td>
                        </tr>
                      )}
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
              <h2 className="text-2xl font-bold text-gray-900">Kurs Yönetimi</h2>
              <div className="flex space-x-3">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Rapor Al
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Yeni Kurs
                </button>
              </div>
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
                          Kurs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Öğretmen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Öğrenci Sayısı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fiyat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Puan
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
                      {courses.length > 0 ? courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {course.thumbnail ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={course.thumbnail}
                                  alt={course.title}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500">{course.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.teacher?.user?.full_name || 'Bilinmiyor'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {course.student_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₺{(course.price || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-900">{course.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                              {course.status === 'active' ? 'Aktif' : 
                               course.status === 'draft' ? 'Taslak' : 'Arşivlendi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Henüz kurs bulunmuyor
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analitik ve Raporlar</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Analitik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {analytics?.userStats?.total || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Aktif Kurslar</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {analytics?.courseStats?.total || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₺{(analytics?.systemStats?.totalRevenue || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Büyüme Oranı</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {analytics?.userGrowth?.growthRate || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Kullanıcı Büyümesi</h3>
                    {analytics?.userGrowth?.monthlyData ? (
                      <div className="space-y-4">
                        {analytics.userGrowth.monthlyData.map((data, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{data.month}</span>
                            <span className="text-sm text-gray-900">{data.users} kullanıcı</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Kullanıcı büyüme verisi bulunamadı</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Gelir Analizi</h3>
                    {analytics?.revenue?.monthlyData ? (
                      <div className="space-y-4">
                        {analytics.revenue.monthlyData.map((data, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{data.month}</span>
                            <span className="text-sm text-gray-900">₺{data.revenue.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Gelir analizi verisi bulunamadı</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Finansal Yönetim</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Bu Ay Gelir</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₺{(analytics?.revenue?.monthly || 89450).toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Toplam Gelir</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₺{(analytics?.revenue?.total || analytics?.systemStats?.totalRevenue || 456780).toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Bekleyen Ödemeler</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₺{(analytics?.revenue?.pending || 12340).toLocaleString()}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Gelir Detayları */}
                {analytics?.revenue?.monthlyData && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Aylık Gelir Detayları</h3>
                    <div className="space-y-4">
                      {analytics.revenue.monthlyData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-gray-700">{data.month}</span>
                            <p className="text-xs text-gray-500">Aylık gelir</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">₺{data.revenue.toLocaleString()}</span>
                            {index > 0 && (
                              <p className="text-xs text-green-600">
                                +{(((data.revenue - analytics.revenue.monthlyData[index - 1].revenue) / analytics.revenue.monthlyData[index - 1].revenue) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sistem Yönetimi</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sistem Durumu</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sunucu Durumu</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {analytics?.systemStats?.serverStatus === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Veritabanı</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {analytics?.systemStats?.databaseStatus === 'online' ? 'Bağlı' : 'Bağlantısız'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Yedekleme</span>
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {analytics?.systemStats?.lastBackup ? analytics.systemStats.lastBackup : 'Güncel'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Database className="h-8 w-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Yedek Al</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Zap className="h-8 w-8 text-orange-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Cache Temizle</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Globe className="h-8 w-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">CDN Güncelle</span>
                      </button>
                      <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Activity className="h-8 w-8 text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">Log Görüntüle</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sistem Metrikleri */}
                {analytics?.systemStats && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sistem Metrikleri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{analytics?.systemStats?.totalUsers || 0}</p>
                        <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{analytics?.systemStats?.activeCourses || 0}</p>
                        <p className="text-sm text-gray-600">Aktif Kurslar</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{analytics?.systemStats?.newRegistrations || 0}</p>
                        <p className="text-sm text-gray-600">Yeni Kayıtlar</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">₺{(analytics?.systemStats?.totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Toplam Gelir</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Genel Ayarlar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Başlığı
                    </label>
                    <input
                      type="text"
                      defaultValue={analytics?.systemStats?.siteTitle || "Atlas Derslik"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Açıklaması
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={analytics?.systemStats?.siteDescription || "Türkiye'nin en kapsamlı online eğitim platformu"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Yeni Kayıtlar</h4>
                      <p className="text-sm text-gray-500">Yeni kullanıcı kayıtlarına izin ver</p>
                    </div>
                    <button 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        analytics?.systemStats?.allowRegistrations !== false ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          analytics?.systemStats?.allowRegistrations !== false ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Sistem e-posta bildirimlerini etkinleştir</p>
                    </div>
                    <button 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        analytics?.systemStats?.emailNotifications !== false ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          analytics?.systemStats?.emailNotifications !== false ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;