import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacher } from '@/hooks/useTeacher';
import { Calendar, Clock, User, MapPin, DollarSign, ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimeSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  price?: number;
}

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const { profile, lessons, setAvailability, loading } = useTeacher();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    start_time: '',
    end_time: '',
    price: profile?.hourly_rate || 0
  });

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
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

  const getLessonsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return lessons?.filter(lesson => lesson.lesson_date?.startsWith(dateStr)) || [];
  };

  const getAvailabilityForDate = (date: Date) => {
    const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
    return [];
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

  const handleAddTimeSlot = async () => {
    if (!selectedDate || !newSlot.start_time || !newSlot.end_time) return;

    const dayName = selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' });
    const timeSlot: TimeSlot = {
      id: Date.now().toString(),
      day: dayName,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_available: true,
      price: newSlot.price
    };

    try {
      await setAvailability({ day: dayName, slots: [timeSlot] });
      setShowAddSlot(false);
      setNewSlot({ start_time: '', end_time: '', price: profile?.hourly_rate || 0 });
    } catch (error) {
      console.error('Müsaitlik eklenirken hata:', error);
    }
  };

  const handleRemoveTimeSlot = async (slotId: string) => {
    try {
      // Remove time slot logic would go here
      console.log('Removing slot:', slotId);
    } catch (error) {
      console.error('Müsaitlik silinirken hata:', error);
    }
  };

  const todayLessons = lessons?.filter(lesson => {
    const today = new Date().toISOString().split('T')[0];
    return lesson.lesson_date?.startsWith(today);
  }) || [];

  const upcomingLessons = lessons?.filter(lesson => {
    const lessonDate = new Date(lesson.lesson_date || '');
    const today = new Date();
    return lessonDate > today;
  }).slice(0, 5) || [];

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
                  <Calendar className="h-6 w-6" />
                  <span>Ders Takvimi</span>
                </h1>
                <p className="text-gray-600">Derslerinizi ve müsaitliğinizi yönetin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    >
                      Bugün
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
                    const dayLessons = getLessonsForDate(date);
                    const dayAvailability = getAvailabilityForDate(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          min-h-[100px] p-2 border border-gray-200 cursor-pointer transition-colors
                          ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                          ${isToday(date) ? 'ring-2 ring-purple-500' : ''}
                          ${isSelected ? 'bg-purple-50 border-purple-300' : ''}
                          ${isPast(date) && isCurrentMonth ? 'opacity-60' : ''}
                        `}
                      >
                        <div className="text-sm font-medium mb-1">
                          {date.getDate()}
                        </div>
                        
                        {/* Lessons */}
                        {dayLessons.slice(0, 2).map(lesson => (
                          <div
                            key={lesson.id}
                            className={`
                              text-xs p-1 mb-1 rounded truncate
                              ${lesson.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                lesson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}
                            `}
                          >
                            {lesson.start_time} - {lesson.subject}
                          </div>
                        ))}
                        
                        {dayLessons.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayLessons.length - 2} daha
                          </div>
                        )}
                        
                        {/* Availability indicators */}
                        {dayAvailability.length > 0 && dayLessons.length === 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            {dayAvailability.length} müsait slot
                          </div>
                        )}
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
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bugünkü Dersler</h3>
              </div>
              <div className="p-4">
                {todayLessons.length > 0 ? (
                  <div className="space-y-3">
                    {todayLessons.map(lesson => (
                      <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{lesson.subject}</span>
                          <span className={`
                            px-2 py-1 text-xs rounded-full
                            ${lesson.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              lesson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {lesson.status === 'confirmed' ? 'Onaylandı' :
                             lesson.status === 'pending' ? 'Bekliyor' : lesson.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.start_time} - {lesson.end_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>{lesson.student_name}</span>
                          </div>
                          {lesson.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3 w-3" />
                              <span>{lesson.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-3 w-3" />
                            <span>{lesson.price}₺</span>
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

            {/* Upcoming Lessons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Yaklaşan Dersler</h3>
              </div>
              <div className="p-4">
                {upcomingLessons.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingLessons.map(lesson => (
                      <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1">{lesson.subject}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{new Date(lesson.lesson_date || '').toLocaleDateString('tr-TR')}</div>
                          <div>{lesson.start_time} - {lesson.end_time}</div>
                          <div>{lesson.student_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Yaklaşan ders bulunmuyor</p>
                )}
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Lessons for selected date */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dersler</h4>
                      {getLessonsForDate(selectedDate).length > 0 ? (
                        <div className="space-y-2">
                          {getLessonsForDate(selectedDate).map(lesson => (
                            <div key={lesson.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{lesson.subject}</div>
                              <div className="text-gray-600">
                                {lesson.start_time} - {lesson.end_time}
                              </div>
                              <div className="text-gray-600">{lesson.student_name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Ders bulunmuyor</p>
                      )}
                    </div>

                    {/* Availability for selected date */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Müsaitlik</h4>
                        {!isPast(selectedDate) && (
                          <button
                            onClick={() => setShowAddSlot(true)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {getAvailabilityForDate(selectedDate).length > 0 ? (
                        <div className="space-y-2">
                          {getAvailabilityForDate(selectedDate).map(slot => (
                            <div key={slot.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                              <div>
                                <div className="font-medium text-green-800">
                                  {slot.start_time} - {slot.end_time}
                                </div>
                                {slot.price && (
                                  <div className="text-green-600">{slot.price}₺/saat</div>
                                )}
                              </div>
                              {!isPast(selectedDate) && (
                                <button
                                  onClick={() => handleRemoveTimeSlot(slot.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Müsait slot bulunmuyor</p>
                      )}
                    </div>

                    {/* Add Time Slot Form */}
                    {showAddSlot && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Yeni Müsait Slot</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Başlangıç Saati
                            </label>
                            <input
                              type="time"
                              value={newSlot.start_time}
                              onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bitiş Saati
                            </label>
                            <input
                              type="time"
                              value={newSlot.end_time}
                              onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Saatlik Ücret (₺)
                            </label>
                            <input
                              type="number"
                              value={newSlot.price}
                              onChange={(e) => setNewSlot(prev => ({ ...prev, price: Number(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              min="0"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleAddTimeSlot}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              Ekle
                            </button>
                            <button
                              onClick={() => setShowAddSlot(false)}
                              className="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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