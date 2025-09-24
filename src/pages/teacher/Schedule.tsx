import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Plus, ChevronLeft, ChevronRight, BookOpen, Users } from 'lucide-react';
import { useTeacher } from '@/hooks/useTeacher';

interface Lesson {
  id: string;
  subject: string;
  class_level: string;
  class_section: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  student_count?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  lesson_notes?: string;
  teacher_name?: string;
  teacher_id: string;
  created_at: string;
}

const TeacherSchedule: React.FC = () => {
  const { getLessons } = useTeacher();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await getLessons();
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const getLessonsForDay = (dayName: string) => {
    const today = new Date();
    const weekStart = getWeekStart(currentWeek);
    const dayIndex = daysOfWeek.indexOf(dayName);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    return lessons.filter(lesson => lesson.lesson_date?.startsWith(dateStr));
  };

  const getWeekStart = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM format
  };

  const getDayName = (date: Date) => {
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return dayNames[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getLessonsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return lessons?.filter(lesson => lesson.lesson_date?.startsWith(dateStr)) || [];
  };

  const getAvailabilityForDate = (date: Date) => {
    const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
    return [];
  };

  const weekDates = getWeekDates(currentWeek);
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const todayLessons = lessons.filter(lesson => lesson.lesson_date?.startsWith(todayDateStr));
  const upcomingLessons = lessons
    .filter(lesson => new Date(lesson.lesson_date) >= today)
    .sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Program yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ders Programı</h1>
          <p className="mt-2 text-gray-600">
            Haftalık ders programınızı görüntüleyin ve derslerinizi takip edin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {weekDates[0]?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - 
                    {weekDates[6]?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateWeek('prev')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentWeek(new Date())}
                      className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Bu Hafta
                    </button>
                    <button
                      onClick={() => navigateWeek('next')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule Grid */}
              <div className="p-6">
                <div className="grid grid-cols-8 gap-2">
                  {/* Time column header */}
                  <div className="text-center text-sm font-medium text-gray-500 py-2">
                    Saat
                  </div>
                  
                  {/* Day headers */}
                  {weekDates.map((date, index) => (
                    <div key={index} className="text-center py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {daysOfWeek[index].substring(0, 3)}
                      </div>
                      <div className={`text-xs ${
                        isToday(date) ? 'text-purple-600 font-semibold' : 'text-gray-500'
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                  ))}

                  {/* Time slots and lessons */}
                  {timeSlots.map(time => (
                    <React.Fragment key={time}>
                      {/* Time label */}
                      <div className="text-center text-sm text-gray-500 py-3 border-t border-gray-100">
                        {time}
                      </div>
                      
                      {/* Day cells */}
                      {daysOfWeek.map((day, dayIndex) => {
                        const weekStart = getWeekStart(currentWeek);
                        const targetDate = new Date(weekStart);
                        targetDate.setDate(weekStart.getDate() + dayIndex);
                        const dateStr = targetDate.toISOString().split('T')[0];
                        
                        const dayLessons = lessons.filter(lesson => {
                          if (!lesson.lesson_date?.startsWith(dateStr)) return false;
                          return lesson.start_time.substring(0, 5) === time;
                        });
                        
                        return (
                          <div 
                            key={`${day}-${time}`}
                            className={`min-h-[60px] border border-gray-100 p-1 ${
                              isToday(weekDates[dayIndex]) ? 'bg-purple-50' : 'bg-white'
                            } hover:bg-gray-50 transition-colors cursor-pointer`}
                            onClick={() => setSelectedDay(day)}
                          >
                            {dayLessons.map(lesson => {
                              const statusColor = lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800';
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className={`${statusColor} text-xs p-1 rounded mb-1 truncate`}
                                  title={`${lesson.subject} - ${lesson.class_level}${lesson.class_section} (${lesson.status})`}
                                >
                                  <div className="font-medium">{lesson.subject}</div>
                                  <div className="text-xs">{lesson.class_level}{lesson.class_section}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Lessons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Bugünkü Dersler</h3>
                </div>
              </div>
              <div className="p-4">
                {todayLessons.length > 0 ? (
                  <div className="space-y-3">
                    {todayLessons.map(lesson => (
                      <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1">{lesson.subject}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-3 w-3" />
                            <span>{lesson.class_level}{lesson.class_section}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Bugün ders bulunmuyor</p>
                )}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Haftalık Özet</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Toplam Ders</span>
                    <span className="font-semibold text-gray-900">{lessons.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bugünkü Dersler</span>
                    <span className="font-semibold text-gray-900">{todayLessons.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Farklı Sınıflar</span>
                    <span className="font-semibold text-gray-900">
                      {new Set(lessons.map(l => `${l.class_level}${l.class_section}`)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Day Details */}
            {selectedDay && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDay} Dersleri
                  </h3>
                </div>
                <div className="p-4">
                  {getLessonsForDay(selectedDay).length > 0 ? (
                    <div className="space-y-2">
                      {getLessonsForDay(selectedDay)
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map(lesson => {
                          const statusColor = lesson.status === 'completed' ? 'border-green-200 bg-green-50' :
                                            lesson.status === 'cancelled' ? 'border-red-200 bg-red-50' :
                                            'border-blue-200 bg-blue-50';
                          
                          return (
                            <div key={lesson.id} className={`p-3 rounded border ${statusColor}`}>
                              <div className="font-medium text-gray-900">{lesson.subject}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <div>{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</div>
                                <div>{lesson.class_level}{lesson.class_section}</div>
                                {lesson.student_count && (
                                  <div>{lesson.student_count} öğrenci</div>
                                )}
                                <div className="capitalize text-xs mt-1 font-medium">
                                  {lesson.status === 'scheduled' ? 'Planlanmış' :
                                   lesson.status === 'completed' ? 'Tamamlanmış' : 'İptal Edilmiş'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Bu gün ders bulunmuyor</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;