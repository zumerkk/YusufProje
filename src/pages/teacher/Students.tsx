import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacher, Student } from '@/hooks/useTeacher';
import { User, Mail, Phone, Calendar, Clock, Star, Search, Filter, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherStudents: React.FC = () => {
  const { user } = useAuth();
  const { profile, lessons, students, loading, getStudents } = useTeacher();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lessons' | 'rating' | 'last_lesson'>('name');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (user?.id) {
      getStudents();
    }
  }, [user?.id, getStudents]);

  const filteredStudents = (students || [])
    .filter(student => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'lessons':
          return b.total_lessons - a.total_lessons;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'last_lesson':
          return new Date(b.last_lesson_date || '').getTime() - new Date(a.last_lesson_date || '').getTime();
        default:
          return 0;
      }
    });

  const getStudentLessons = (studentId: string) => {
    return lessons?.filter(lesson => lesson.student_id === studentId) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalActiveStudents = (students || []).filter(s => s.status === 'active').length;
  const totalLessonsThisMonth = (students || []).reduce((sum, student) => {
    const thisMonth = new Date().getMonth();
    const studentLessonsThisMonth = getStudentLessons(student.id).filter(lesson => {
      const lessonDate = new Date(lesson.lesson_date || '');
      return lessonDate.getMonth() === thisMonth;
    }).length;
    return sum + studentLessonsThisMonth;
  }, 0);
  const averageStudentRating = (students || []).length > 0 
    ? (students || []).reduce((sum, student) => sum + student.average_rating, 0) / (students || []).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
                to="/teacher/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Geri
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>Öğrencilerim</span>
                </h1>
                <p className="text-gray-600">Öğrenci bilgilerini ve ders geçmişini görüntüle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-gray-900">{(students || []).length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Öğrenci</p>
                <p className="text-2xl font-bold text-green-600">{totalActiveStudents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Ders</p>
                <p className="text-2xl font-bold text-purple-600">{totalLessonsThisMonth}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-yellow-600">{averageStudentRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Öğrenci ara (isim, e-posta, ders)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'lessons' | 'rating' | 'last_lesson')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="name">İsme Göre</option>
                  <option value="lessons">Ders Sayısına Göre</option>
                  <option value="rating">Puana Göre</option>
                  <option value="last_lesson">Son Derse Göre</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="p-6">
                {/* Student Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">{student.grade}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                    {student.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.school && (
                    <div className="text-sm text-gray-600">
                      <span>{student.school}</span>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map(subject => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{student.completed_lessons}</div>
                    <div className="text-xs text-gray-600">Tamamlanan Ders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{student.total_hours}h</div>
                    <div className="text-xs text-gray-600">Toplam Saat</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{student.average_rating}</span>
                    <span className="text-sm text-gray-600">({student.completed_lessons} ders)</span>
                  </div>
                  {student.last_lesson_date && (
                    <div className="text-xs text-gray-500">
                      Son: {new Date(student.last_lesson_date).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Öğrenci bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.full_name}</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Student Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedStudent.email}</span>
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Eğitim Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Sınıf:</strong> {selectedStudent.grade}</div>
                    {selectedStudent.school && (
                      <div><strong>Okul:</strong> {selectedStudent.school}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson History */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Ders Geçmişi</h3>
                <div className="space-y-3">
                  {getStudentLessons(selectedStudent.id).slice(0, 5).map(lesson => (
                    <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{lesson.subject}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                          lesson.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          lesson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lesson.status === 'completed' ? 'Tamamlandı' :
                           lesson.status === 'confirmed' ? 'Onaylandı' :
                           lesson.status === 'pending' ? 'Bekliyor' : lesson.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(lesson.lesson_date || '').toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.start_time} - {lesson.end_time}</span>
                        </div>
                        {lesson.rating && (
                          <div className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span>{lesson.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>Mesaj Gönder</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Ders Planla</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;