import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Filter, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTeacher } from '../../hooks/useTeacher';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface LessonLocal {
  id: string;
  subject: string;
  class_level: number;
  class_section: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  student_count?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  lesson_notes?: string;
  teacher_name?: string;
}

interface NewLessonForm {
  subject: string;
  class_level: number;
  class_section: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  lesson_date: string;
  lesson_notes: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Pazartesi' },
  { value: 'tuesday', label: 'Salı' },
  { value: 'wednesday', label: 'Çarşamba' },
  { value: 'thursday', label: 'Perşembe' },
  { value: 'friday', label: 'Cuma' },
  { value: 'saturday', label: 'Cumartesi' },
  { value: 'sunday', label: 'Pazar' }
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Lessons: React.FC = () => {
  const { 
    lessons, 
    loading, 
    getLessons 
  } = useTeacher();
  
  const { user } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [classLevels, setClassLevels] = useState<number[]>([]);
  const [classSections, setClassSections] = useState<string[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [filterDay, setFilterDay] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredLessons, setFilteredLessons] = useState<LessonLocal[]>([]);
  
  const [newLesson, setNewLesson] = useState<NewLessonForm>({
    subject: '',
    class_level: 0,
    class_section: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    lesson_date: '',
    lesson_notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (newLesson.class_level > 0) {
      loadClassSections(newLesson.class_level);
    }
  }, [newLesson.class_level]);

  useEffect(() => {
    if (newLesson.class_level > 0 && newLesson.class_section) {
      loadStudentCount(newLesson.class_level, newLesson.class_section);
    }
  }, [newLesson.class_level, newLesson.class_section]);

  // Dersleri filtrele
  useEffect(() => {
    if (!lessons || !user?.subject) {
      setFilteredLessons([]);
      return;
    }

    // Convert lessons to LessonLocal format
    const convertedLessons: LessonLocal[] = lessons.map(lesson => ({
      id: lesson.id,
      subject: lesson.subject,
      class_level: 10, // Mock data
      class_section: 'A', // Mock data
      lesson_date: lesson.lesson_date || lesson.date_time?.split('T')[0] || '',
      start_time: lesson.start_time || lesson.date_time?.split('T')[1]?.substring(0, 5) || '',
      end_time: lesson.end_time || '',
      duration_minutes: lesson.duration_minutes,
      student_count: 25, // Mock data
      status: lesson.status === 'confirmed' ? 'scheduled' : lesson.status as 'scheduled' | 'completed' | 'cancelled',
      lesson_notes: lesson.notes,
      teacher_name: 'Mock Teacher'
    }));

    let filtered = convertedLessons.filter(lesson => lesson.subject === user.subject);

    if (filterStatus !== 'all') {
      filtered = filtered.filter(lesson => lesson.status === filterStatus);
    }

    setFilteredLessons(filtered);
  }, [lessons, user?.subject, filterStatus]);

  const loadInitialData = async () => {
    await getLessons();
    await loadClassLevels();
  };

  const loadClassLevels = async () => {
    // Mock class levels
    setClassLevels([9, 10, 11, 12]);
  };

  const loadClassSections = async (gradeLevel: number) => {
    // Mock class sections
    setClassSections(['A', 'B', 'C', 'D']);
  };

  const loadStudentCount = async (gradeLevel: number, classSection: string) => {
    // Mock student count
    setStudentCount(Math.floor(Math.random() * 30) + 15); // 15-45 arası
  };

  const handleGradeLevelChange = (gradeLevel: string) => {
    setNewLesson(prev => ({ ...prev, class_level: parseInt(gradeLevel) || 0, class_section: '' }));
    setClassSections([]);
    setStudentCount(0);
  };

  const handleClassSectionChange = (classSection: string) => {
    setNewLesson(prev => ({ ...prev, class_section: classSection }));
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const getNextDateForDay = (dayOfWeek: string): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayOfWeek);
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLesson.day_of_week || !newLesson.start_time || !newLesson.class_section || !newLesson.subject) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const endTime = calculateEndTime(newLesson.start_time, newLesson.duration_minutes);
    const lessonDate = getNextDateForDay(newLesson.day_of_week);

    const lessonData = {
      ...newLesson,
      subject: user?.subject || newLesson.subject, // Öğretmenin branşını kullan
      end_time: endTime,
      lesson_date: lessonDate
    };

    // Mock lesson creation
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowAddModal(false);
      setNewLesson({
        subject: '',
        class_level: 0,
        class_section: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        lesson_date: '',
        lesson_notes: ''
      });
      setClassSections([]);
      setStudentCount(0);
      toast.success('Ders başarıyla eklendi!');
    } catch (error) {
      toast.error('Ders eklenirken bir hata oluştu');
    }
  };

  // filteredLessons artık state olarak yönetiliyor

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Planlandı';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM formatında göster
  };

  const getDayLabel = (day: string) => {
    const dayObj = DAYS_OF_WEEK.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Derslerim</h1>
          <p className="text-gray-600">Ders programınızı yönetin ve yeni dersler ekleyin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ders
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm dersler</option>
            <option value="scheduled">Planlanmış</option>
            <option value="completed">Tamamlanmış</option>
            <option value="cancelled">İptal edilmiş</option>
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{lesson.subject}</h3>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(lesson.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                  lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(lesson.status)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{lesson.class_level}. Sınıf {lesson.class_section}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(lesson.lesson_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</span>
              </div>
              {lesson.student_count && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{lesson.student_count} öğrenci</span>
                </div>
              )}
              {lesson.lesson_notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <span className="font-medium">Not: </span>
                  {lesson.lesson_notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterStatus !== 'all' ? 'Bu durumda ders bulunamadı' : 'Henüz ders eklenmemiş'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filterStatus !== 'all' ? 'Farklı bir durum seçin veya yeni ders ekleyin.' : 'İlk dersinizi eklemek için "Yeni Ders" butonuna tıklayın.'}
          </p>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Ders Ekle</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ders *
                </label>
                <input
                  type="text"
                  value={user?.subject || newLesson.subject}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder={user?.subject || "Matematik, Fizik, vb."}
                  readOnly={!!user?.subject}
                  required
                />
                {user?.subject && (
                  <p className="text-xs text-gray-500 mt-1">Branşınız otomatik olarak seçilmiştir</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sınıf Seviyesi *
                </label>
                <select
                  value={newLesson.class_level}
                  onChange={(e) => handleGradeLevelChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Sınıf seçin</option>
                  {classLevels.map(grade => (
                    <option key={grade} value={grade}>{grade}. Sınıf</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şube *
                </label>
                <select
                  value={newLesson.class_section}
                  onChange={(e) => handleClassSectionChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!newLesson.class_level || classSections.length === 0}
                >
                  <option value="">Şube seçin</option>
                  {classSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                {newLesson.class_level > 0 && classSections.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Bu sınıf seviyesi için şube bulunamadı</p>
                )}
              </div>

              {studentCount > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Users className="w-4 h-4 inline mr-1" />
                    Bu sınıfta {studentCount} öğrenci bulunmaktadır
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gün *
                </label>
                <select
                  value={newLesson.day_of_week}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, day_of_week: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Gün seçin</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Saati *
                </label>
                <select
                  value={newLesson.start_time}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Saat seçin</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Süre (dakika)
                </label>
                <select
                  value={newLesson.duration_minutes}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={40}>40 dakika</option>
                  <option value={60}>60 dakika</option>
                  <option value={90}>90 dakika</option>
                </select>
                {newLesson.start_time && (
                  <p className="text-xs text-gray-500 mt-1">
                    Bitiş saati: {calculateEndTime(newLesson.start_time, newLesson.duration_minutes)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar (isteğe bağlı)
                </label>
                <textarea
                  value={newLesson.lesson_notes}
                  onChange={(e) => setNewLesson(prev => ({ ...prev, lesson_notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ders hakkında notlar..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Ekleniyor...' : 'Ders Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;