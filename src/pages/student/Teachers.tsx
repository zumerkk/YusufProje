import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudent';
import { Teacher } from '../../../shared/types';
import { Search, Filter, Star, MapPin, Clock, User, BookOpen, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const Teachers: React.FC = () => {
  const { searchTeachers, loading } = useStudent();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const subjects = [
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
    'Tarih', 'Coğrafya', 'İngilizce', 'Almanca', 'Fransızca', 'Felsefe'
  ];

  useEffect(() => {
    loadTeachers();
  }, [searchQuery, selectedSubject, priceRange, sortBy]);

  const loadTeachers = async () => {
    try {
      const filters = {
        subject: selectedSubject,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy
      };
      const result = await searchTeachers(searchQuery, filters);
      if (result.success && result.teachers) {
        setTeachers(result.teachers);
      }
    } catch (error) {
      console.error('Öğretmenler yüklenirken hata:', error);
      // Mock data for development
      setTeachers([
        {
          id: '1',
          profile_id: '1',
          full_name: 'Ahmet Yılmaz',
          bio: 'Matematik alanında 10 yıllık deneyime sahip öğretmen. Öğrencilerimin başarısı için elimden geleni yapıyorum.',
          hourly_rate: 150,
          experience_years: 10,
          rating: 4.8,
          total_reviews: 32,
          subjects: ['Matematik', 'Fizik'],
          availability_status: 'available',
          location: 'İstanbul, Kadıköy',
          is_verified: true,
          total_lessons: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          profile_id: '2',
          full_name: 'Elif Kaya',
          bio: 'İngilizce öğretmeni olarak öğrencilerimin dil becerilerini geliştirmelerine yardımcı oluyorum.',
          hourly_rate: 120,
          experience_years: 7,
          rating: 4.9,
          total_reviews: 32,
          subjects: ['İngilizce'],
          availability_status: 'available',
          location: 'Ankara, Çankaya',
          is_verified: true,
          total_lessons: 32,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          profile_id: '3',
          full_name: 'Mehmet Demir',
          bio: 'Kimya ve Biyoloji derslerinde uzmanım. Fen bilimlerini sevdirmeyi hedefliyorum.',
          hourly_rate: 180,
          experience_years: 12,
          rating: 4.7,
          total_reviews: 28,
          subjects: ['Kimya', 'Biyoloji'],
          availability_status: 'busy',
          location: 'İzmir, Bornova',
          is_verified: true,
          total_lessons: 28,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = !selectedSubject || teacher.subjects.includes(selectedSubject);
    const matchesPrice = !teacher.hourly_rate || 
                        (teacher.hourly_rate >= priceRange.min && teacher.hourly_rate <= priceRange.max);
    
    return matchesSearch && matchesSubject && matchesPrice;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price':
        return (a.hourly_rate || 0) - (b.hourly_rate || 0);
      case 'experience':
        return (b.experience_years || 0) - (a.experience_years || 0);
      default:
        return 0;
    }
  });

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'busy': return 'Meşgul';
      case 'offline': return 'Çevrimdışı';
      default: return 'Bilinmiyor';
    }
  };

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
                  <User className="h-6 w-6" />
                  <span>Öğretmenler</span>
                </h1>
                <p className="text-gray-600">Size uygun öğretmeni bulun</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Öğretmen adı veya ders ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tüm Dersler</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'experience')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="rating">Puana Göre</option>
              <option value="price">Fiyata Göre</option>
              <option value="experience">Deneyime Göre</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtreler</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat Aralığı (₺/saat)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teachers List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          </div>
        ) : sortedTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTeachers.map(teacher => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Teacher Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{teacher.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {teacher.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {teacher.rating} ({teacher.total_reviews} değerlendirme)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(teacher.availability_status)}`}>
                      {getAvailabilityText(teacher.availability_status)}
                    </span>
                  </div>

                  {/* Subjects */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map(subject => (
                        <span key={subject} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  {teacher.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{teacher.bio}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {teacher.experience_years && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{teacher.experience_years} yıl deneyim</span>
                      </div>
                    )}
                    {teacher.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{teacher.location}</span>
                      </div>
                    )}
                    {teacher.hourly_rate && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{teacher.hourly_rate}₺/saat</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                      Profili Görüntüle
                    </button>
                    <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                      Mesaj Gönder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Öğretmen bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;