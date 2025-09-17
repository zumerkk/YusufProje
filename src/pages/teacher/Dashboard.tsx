import React from 'react';
import { useTeacher } from '@/hooks/useTeacher';
import { Calendar, Users, BookOpen, TrendingUp, Clock, Star, DollarSign, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const { profile, lessons, students, loading } = useTeacher();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const todayLessons = lessons?.filter(lesson => {
    const today = new Date().toDateString();
    return new Date(lesson.lesson_date).toDateString() === today;
  }) || [];

  const upcomingLessons = lessons?.filter(lesson => {
    const now = new Date();
    const lessonDate = new Date(lesson.lesson_date);
    return lessonDate > now && lesson.status === 'scheduled';
  }).slice(0, 5) || [];

  const completedLessons = lessons?.filter(lesson => lesson.status === 'completed') || [];
  const totalEarnings = completedLessons.reduce((total, lesson) => {
    return total + (lesson.price || 0);
  }, 0);

  const averageRating = completedLessons.length > 0 
    ? completedLessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / completedLessons.length
    : 0;

  const thisMonthLessons = lessons?.filter(lesson => {
    const lessonDate = new Date(lesson.lesson_date);
    const now = new Date();
    return lessonDate.getMonth() === now.getMonth() && 
           lessonDate.getFullYear() === now.getFullYear();
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hoş geldin, {profile?.full_name || 'Öğretmen'}!
              </h1>
              <p className="text-gray-600">Öğretmen panelinize genel bakış</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/teacher/schedule"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Takvimi Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugünkü Dersler</p>
                <p className="text-2xl font-bold text-gray-900">{todayLessons.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-gray-900">{students?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Kazanç</p>
                <p className="text-2xl font-bold text-gray-900">{totalEarnings.toLocaleString('tr-TR')}₺</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Bugünkü Program</span>
                  </h2>
                  <Link
                    to="/teacher/schedule"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Tümünü Gör
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {todayLessons.length > 0 ? (
                  <div className="space-y-4">
                    {todayLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{lesson.subject}</h3>
                          <p className="text-sm text-gray-600">
                            Öğrenci: {lesson.student_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(lesson.lesson_date).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {lesson.duration_minutes} dakika
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                            lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {lesson.status === 'completed' ? 'Tamamlandı' :
                             lesson.status === 'cancelled' ? 'İptal Edildi' :
                             'Planlandı'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bugün ders yok</h3>
                    <p className="text-gray-600">Bugün için planlanmış ders bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/teacher/schedule"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Takvimi Görüntüle</span>
                </Link>
                <Link
                  to="/teacher/students"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900">Öğrencilerim</span>
                </Link>
                <Link
                  to="/teacher/upload"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-gray-900">Dosya Yükle</span>
                </Link>
                <Link
                  to="/teacher/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-900">Profili Düzenle</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Lessons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Yaklaşan Dersler</h3>
              </div>
              <div className="p-6">
                {upcomingLessons.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{lesson.subject}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(lesson.lesson_date).toLocaleDateString('tr-TR')} - 
                            {new Date(lesson.lesson_date).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Yaklaşan ders bulunmuyor</p>
                )}
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bu Ay İstatistikleri</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Ders</span>
                  <span className="font-semibold text-gray-900">{thisMonthLessons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tamamlanan</span>
                  <span className="font-semibold text-green-600">
                    {thisMonthLessons.filter(l => l.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kazanç</span>
                  <span className="font-semibold text-purple-600">
                    {thisMonthLessons
                      .filter(l => l.status === 'completed')
                      .reduce((sum, l) => sum + (l.price || 0), 0)
                      .toLocaleString('tr-TR')}₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;