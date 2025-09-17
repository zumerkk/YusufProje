import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';

import { Users, BookOpen, DollarSign, Star, Activity, Clock, Shield, TrendingUp, UserPlus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  user?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { analytics, getAnalytics, getRecentActivities, loading } = useAdmin();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    getAnalytics();
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    const result = await getRecentActivities(5);
    if (result.success) {
      setRecentActivities(result.activities || []);
    }
  };

  // Icon render function
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="h-4 w-4" />;
      case 'check-circle':
        return <CheckCircle className="h-4 w-4" />;
      case 'star':
        return <Star className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Use analytics data or fallback to default values
  const stats = {
    totalUsers: analytics?.userStats?.totalUsers || 0,
    totalTeachers: analytics?.teacherStats?.totalTeachers || 0,
    totalStudents: (analytics?.userStats?.totalUsers || 0) - (analytics?.teacherStats?.totalTeachers || 0),
    totalLessons: analytics?.lessonStats?.totalLessons || 0,
    completedLessons: analytics?.lessonStats?.completedLessons || 0,
    pendingLessons: (analytics?.lessonStats?.totalLessons || 0) - (analytics?.lessonStats?.completedLessons || 0),
    totalRevenue: analytics?.teacherStats?.totalEarnings || 0,
    monthlyRevenue: analytics?.revenue?.monthly || 0,
    averageRating: analytics?.lessonStats?.averageRating || 0,
    activeUsers: analytics?.userStats?.activeUsers || 0
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'lesson_completion':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'lesson_review':
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-50 border-blue-200';
      case 'lesson_completion':
        return 'bg-green-50 border-green-200';
      case 'lesson_review':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-gray-600">Sistem genel durumu ve istatistikler</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Gerçek zamanlı veriler
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">Öğretmen: {stats.totalTeachers}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Öğrenci: {stats.totalStudents}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Lessons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLessons.toLocaleString()}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-600">Tamamlanan: {stats.completedLessons}</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-green-600">Bu ay: {formatCurrency(stats.monthlyRevenue)}</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(stats.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({stats.completedLessons} değerlendirme)</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aktif Kullanıcılar</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeUsers}</div>
            <p className="text-sm text-gray-600">Son 24 saatte aktif</p>
            <div className="mt-4 bg-green-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pending Lessons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bekleyen Dersler</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingLessons}</div>
            <p className="text-sm text-gray-600">Onay bekliyor</p>
            <div className="mt-4">
              <Link 
                to="/admin/lessons" 
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Detayları Görüntüle →
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Çalışıyor</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Veritabanı</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Çalışıyor</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ödeme Sistemi</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Çalışıyor</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
                <Link 
                  to="/admin/activities" 
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Tümünü Görüntüle
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{activity.user}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Kullanıcılar</h3>
                      <p className="text-sm text-gray-600">Yönet</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Analitik</h3>
                      <p className="text-sm text-gray-600">Raporlar</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/lessons"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Dersler</h3>
                      <p className="text-sm text-gray-600">Yönet</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/settings"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Ayarlar</h3>
                      <p className="text-sm text-gray-600">Sistem</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;