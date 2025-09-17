import React, { useState, useEffect } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Calendar: React.FC = () => {
  const { lessons, loading, getLessons, reviewLesson } = useStudent();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    getLessons();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getLessonsForDate = (date: Date) => {
    if (!lessons) return [];
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date_time);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  const handleReviewLesson = async () => {
    if (!selectedLesson) return;
    
    const result = await reviewLesson({
      lesson_id: selectedLesson.id,
      rating,
      comment
    });
    
    if (result.success) {
      setShowReviewModal(false);
      setSelectedLesson(null);
      setRating(5);
      setComment('');
      getLessons(); // Refresh lessons
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

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
                to="/student/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Geri
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <CalendarIcon className="h-6 w-6" />
                  <span>Ders Takvimi</span>
                </h1>
                <p className="text-gray-600">Derslerini takip et</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-24"></div>;
                    }

                    const dayLessons = getLessonsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={day.getDate()}
                        className={`p-2 h-24 border border-gray-100 rounded-lg ${
                          isToday ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm font-medium ${
                          isToday ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayLessons.slice(0, 2).map(lesson => (
                            <div
                              key={lesson.id}
                              className={`text-xs p-1 rounded text-white truncate ${
                                lesson.status === 'completed' ? 'bg-green-500' :
                                lesson.status === 'cancelled' ? 'bg-red-500' :
                                'bg-purple-500'
                              }`}
                              title={`${lesson.subject} - ${new Date(lesson.date_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                            >
                              {lesson.subject}
                            </div>
                          ))}
                          {dayLessons.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayLessons.length - 2} daha
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Lessons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bugünkü Dersler</h3>
              </div>
              <div className="p-6">
                {(() => {
                  const todayLessons = getLessonsForDate(new Date());
                  return todayLessons.length > 0 ? (
                    <div className="space-y-4">
                      {todayLessons.map(lesson => (
                        <div key={lesson.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{lesson.subject}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(lesson.date_time).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {lesson.duration_minutes} dk
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {lesson.status === 'completed' ? 'Tamamlandı' :
                                 lesson.status === 'cancelled' ? 'İptal Edildi' :
                                 'Planlandı'}
                              </span>
                              {lesson.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setSelectedLesson(lesson);
                                    setShowReviewModal(true);
                                  }}
                                  className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                  <Star className="h-3 w-3" />
                                  <span>Değerlendir</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Bugün ders bulunmuyor</p>
                  );
                })()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bu Ay</h3>
              </div>
              <div className="p-6 space-y-4">
                {(() => {
                  const currentMonthLessons = lessons?.filter(lesson => {
                    const lessonDate = new Date(lesson.date_time);
                    return lessonDate.getMonth() === currentDate.getMonth() &&
                           lessonDate.getFullYear() === currentDate.getFullYear();
                  }) || [];

                  const completedLessons = currentMonthLessons.filter(l => l.status === 'completed').length;
                  const scheduledLessons = currentMonthLessons.filter(l => l.status === 'scheduled').length;

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Toplam Ders</span>
                        <span className="font-semibold text-gray-900">{currentMonthLessons.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tamamlanan</span>
                        <span className="font-semibold text-green-600">{completedLessons}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Planlanan</span>
                        <span className="font-semibold text-purple-600">{scheduledLessons}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dersi Değerlendir
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ders: {selectedLesson.subject}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puan (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorum (İsteğe bağlı)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Ders hakkında yorumunuz..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedLesson(null);
                  setRating(5);
                  setComment('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReviewLesson}
                className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;