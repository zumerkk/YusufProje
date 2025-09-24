import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  Star, 
  Clock,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  RefreshCw,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  period: string;
  users: number;
  lessons: number;
  revenue: number;
  rating: number;
}

interface SubjectData {
  name: string;
  lessons: number;
  revenue: number;
  color: string;
}

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { analytics, getAnalytics, loading } = useAdmin();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    await getAnalytics();
  };

  // Mock analytics data
  const monthlyData: AnalyticsData[] = [
    { period: 'Oca', users: 45, lessons: 120, revenue: 15000, rating: 4.2 },
    { period: 'Şub', users: 52, lessons: 145, revenue: 18500, rating: 4.3 },
    { period: 'Mar', users: 48, lessons: 135, revenue: 17200, rating: 4.4 },
    { period: 'Nis', users: 61, lessons: 168, revenue: 21600, rating: 4.5 },
    { period: 'May', users: 58, lessons: 156, revenue: 20100, rating: 4.4 },
    { period: 'Haz', users: 67, lessons: 189, revenue: 24300, rating: 4.6 },
    { period: 'Tem', users: 72, lessons: 201, revenue: 26800, rating: 4.7 },
    { period: 'Ağu', users: 69, lessons: 195, revenue: 25200, rating: 4.6 },
    { period: 'Eyl', users: 74, lessons: 210, revenue: 28500, rating: 4.8 },
    { period: 'Eki', users: 78, lessons: 225, revenue: 30200, rating: 4.7 },
    { period: 'Kas', users: 82, lessons: 238, revenue: 32100, rating: 4.9 },
    { period: 'Ara', users: 85, lessons: 245, revenue: 33800, rating: 4.8 }
  ];

  const subjectData: SubjectData[] = [
    { name: 'Matematik', lessons: 156, revenue: 45600, color: '#8B5CF6' },
    { name: 'Fizik', lessons: 134, revenue: 38200, color: '#06B6D4' },
    { name: 'Kimya', lessons: 98, revenue: 28400, color: '#10B981' },
    { name: 'Biyoloji', lessons: 87, revenue: 24800, color: '#F59E0B' },
    { name: 'İngilizce', lessons: 145, revenue: 41200, color: '#EF4444' },
    { name: 'Türkçe', lessons: 112, revenue: 31800, color: '#8B5CF6' },
    { name: 'Tarih', lessons: 76, revenue: 21600, color: '#6B7280' },
    { name: 'Coğrafya', lessons: 65, revenue: 18500, color: '#EC4899' }
  ];

  // Package sales data
  const packageSalesData = [
    { name: 'Okul Destek Paketi', sales: 45, revenue: 134550, growth: 12.5, color: '#8B5CF6' },
    { name: 'Sınav Hazırlık Paketi', sales: 38, revenue: 152000, growth: 8.3, color: '#06B6D4' },
    { name: 'Özel Ders Paketi', sales: 29, revenue: 87000, growth: -2.1, color: '#10B981' },
    { name: 'Yoğunlaştırılmış Paket', sales: 22, revenue: 110000, growth: 15.7, color: '#F59E0B' }
  ];

  const packageTrendData = [
    { month: 'Oca', okul: 12, sinav: 8, ozel: 5, yogun: 3 },
    { month: 'Şub', okul: 15, sinav: 12, ozel: 7, yogun: 5 },
    { month: 'Mar', okul: 18, sinav: 15, ozel: 9, yogun: 6 },
    { month: 'Nis', okul: 22, sinav: 18, ozel: 11, yogun: 8 },
    { month: 'May', okul: 28, sinav: 22, ozel: 14, yogun: 10 },
    { month: 'Haz', okul: 35, sinav: 28, ozel: 18, yogun: 13 }
  ];

  const weeklyGrowthData = [
    { day: 'Pzt', users: 12, lessons: 28, revenue: 3200 },
    { day: 'Sal', users: 15, lessons: 32, revenue: 3800 },
    { day: 'Çar', users: 18, lessons: 35, revenue: 4100 },
    { day: 'Per', users: 14, lessons: 30, revenue: 3600 },
    { day: 'Cum', users: 22, lessons: 45, revenue: 5200 },
    { day: 'Cmt', users: 28, lessons: 52, revenue: 6100 },
    { day: 'Paz', users: 16, lessons: 38, revenue: 4400 }
  ];

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Son 7 Gün';
      case '30d': return 'Son 30 Gün';
      case '90d': return 'Son 90 Gün';
      case '1y': return 'Son 1 Yıl';
      default: return 'Son 30 Gün';
    }
  };

  const totalUsers = analytics?.userStats?.totalUsers || 0;
  const totalLessons = analytics?.lessonStats?.totalLessons || 0;
  const totalRevenue = analytics?.systemStats?.totalRevenue || 0;
  const averageRating = analytics?.lessonStats?.averageRating || 0;
  
  const userGrowth = analytics?.userStats?.userGrowth || 0;
  const lessonGrowth = 0; // Not available in current analytics structure
  const revenueGrowth = 0; // Not available in current analytics structure
  const ratingGrowth = 0; // Not available in current analytics structure

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadAnalytics();
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analitik verileri yükleniyor...</p>
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
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Geri
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Analitik</span>
                </h1>
                <p className="text-gray-600">Platform performansını ve istatistikleri görüntüle</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
                <option value="1y">Son 1 Yıl</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Rapor İndir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">+{typeof userGrowth === 'number' ? userGrowth : 0}%</span>
                  <span className="text-sm text-gray-500 ml-1">bu ay</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ders</p>
                <p className="text-2xl font-bold text-gray-900">{totalLessons.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">+{lessonGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">bu ay</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">+{revenueGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">bu ay</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">+{ratingGrowth}%</span>
                  <span className="text-sm text-gray-500 ml-1">bu ay</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Aylık Trendler</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Son 12 Ay</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'users' ? `${value} kullanıcı` :
                    name === 'lessons' ? `${value} ders` :
                    name === 'revenue' ? `₺${value}` : value,
                    name === 'users' ? 'Kullanıcı' :
                    name === 'lessons' ? 'Ders' :
                    name === 'revenue' ? 'Gelir' : name
                  ]}
                />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="lessons" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gelir Analizi</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <DollarSign className="h-4 w-4" />
                <span>Aylık</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`₺${value}`, 'Gelir']} />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Subject Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ders Dağılımı</h3>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="lessons"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ders`, 'Toplam']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {subjectData.slice(0, 4).map((subject, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="text-gray-600">{subject.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{subject.lessons}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Haftalık Aktivite</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lessons" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Subjects by Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">En Çok Gelir Getiren</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {subjectData
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((subject, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{subject.name}</div>
                        <div className="text-sm text-gray-500">{subject.lessons} ders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₺{subject.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">gelir</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performans Metrikleri</h3>
            <div className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <div className="text-sm text-gray-600 mt-1">Ders Tamamlama Oranı</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+2.1%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">87.5%</div>
              <div className="text-sm text-gray-600 mt-1">Öğrenci Memnuniyeti</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+1.8%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">76.3%</div>
              <div className="text-sm text-gray-600 mt-1">Öğretmen Aktiflik</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowDown className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600 ml-1">-0.5%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">42 dk</div>
              <div className="text-sm text-gray-600 mt-1">Ortalama Ders Süresi</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+3 dk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Sales Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Package Sales Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Paket Satış Analizi</h3>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {packageSalesData.map((pkg, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: pkg.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500">{pkg.sales} satış</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">₺{pkg.revenue.toLocaleString()}</div>
                    <div className={`text-sm flex items-center ${
                      pkg.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pkg.growth > 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(pkg.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Paket Satış Trendi</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={packageTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} satış`,
                    name === 'okul' ? 'Okul Destek' :
                    name === 'sinav' ? 'Sınav Hazırlık' :
                    name === 'ozel' ? 'Özel Ders' :
                    name === 'yogun' ? 'Yoğunlaştırılmış' : name
                  ]}
                />
                <Line type="monotone" dataKey="okul" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="sinav" stroke="#06B6D4" strokeWidth={2} />
                <Line type="monotone" dataKey="ozel" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="yogun" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Paket İstatistikleri</h3>
            <div className="text-sm text-gray-500">Son 30 Gün</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">134</div>
              <div className="text-sm text-gray-600 mt-1">Toplam Paket Satışı</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+8.5%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₺483,550</div>
              <div className="text-sm text-gray-600 mt-1">Toplam Paket Geliri</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+12.3%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₺3,608</div>
              <div className="text-sm text-gray-600 mt-1">Ortalama Paket Değeri</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+3.2%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">89.2%</div>
              <div className="text-sm text-gray-600 mt-1">Paket Tamamlama Oranı</div>
              <div className="flex items-center justify-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+1.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;