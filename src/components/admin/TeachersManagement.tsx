import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Trash2, Download, Filter, Star, BookOpen, Users, Calendar } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  subject?: string;
  experience_years?: number;
  rating?: number;
  total_students?: number;
  total_lessons?: number;
  bio?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface TeachersManagementProps {
  darkMode: boolean;
}

const TeachersManagement: React.FC<TeachersManagementProps> = ({ darkMode }) => {
  const { getTeachers, updateUser, deleteUser, loading } = useAdmin();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadTeachers();
  }, [searchTerm, selectedFilter, sortBy, sortOrder, currentPage]);

  const loadTeachers = async () => {
    console.log('TeachersManagement: loadTeachers called');
    const result = await getTeachers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: selectedFilter === 'all' ? undefined : selectedFilter,
      sortBy: sortBy,
      sortOrder: sortOrder
    });
    
    console.log('TeachersManagement: getTeachers result:', result);
    
    if (result.success && result.teachers) {
      console.log('TeachersManagement: Setting teachers:', result.teachers);
      setTeachers(result.teachers);
    } else {
      console.error('TeachersManagement: Failed to load teachers:', result);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    // API'den gelen first_name ve last_name'i birleştir
    const fullName = teacher.profiles?.first_name && teacher.profiles?.last_name 
      ? `${teacher.profiles.first_name} ${teacher.profiles.last_name}`.trim()
      : teacher.profiles?.first_name || teacher.profiles?.last_name || 'İsimsiz Öğretmen';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || teacher.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'activate':
          for (const teacherId of selectedTeachers) {
            await updateUser(teacherId, { status: 'active' });
          }
          break;
        case 'deactivate':
          for (const teacherId of selectedTeachers) {
            await updateUser(teacherId, { status: 'inactive' });
          }
          break;
        case 'delete':
          for (const teacherId of selectedTeachers) {
            await deleteUser(teacherId);
          }
          break;
        case 'export':
          exportData('csv');
          break;
      }
      setSelectedTeachers([]);
      loadTeachers();
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
    }
  };

  const exportData = (format: string) => {
    const data = filteredTeachers.map(teacher => {
      const fullName = teacher.profiles?.first_name && teacher.profiles?.last_name 
        ? `${teacher.profiles.first_name} ${teacher.profiles.last_name}`.trim()
        : teacher.profiles?.first_name || teacher.profiles?.last_name || 'İsimsiz Öğretmen';
      
      return {
        'Ad Soyad': fullName,
        'E-posta': teacher.email,
        'Telefon': teacher.phone || '',
        'Branş': teacher.subject || '',
        'Deneyim': teacher.experience_years ? `${teacher.experience_years} yıl` : '',
        'Puan': teacher.rating || '',
        'Öğrenci Sayısı': teacher.total_students || 0,
        'Ders Sayısı': teacher.total_lessons || 0,
        'Durum': teacher.status === 'active' ? 'Aktif' : teacher.status === 'inactive' ? 'Pasif' : 'Askıya Alınmış',
        'Kayıt Tarihi': new Date(teacher.created_at).toLocaleDateString('tr-TR'),
        'Son Giriş': teacher.last_login ? new Date(teacher.last_login).toLocaleDateString('tr-TR') : 'Hiç'
      };
  });

    if (format === 'csv') {
      const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ogretmenler_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Öğretmen ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Tüm Öğretmenler</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="created_at">Kayıt Tarihi</option>
              <option value="full_name">Ad Soyad</option>
              <option value="rating">Puan</option>
              <option value="total_students">Öğrenci Sayısı</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Dışa Aktar
            </button>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Yeni Öğretmen
            </button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedTeachers.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">
                {selectedTeachers.length} öğretmen seçildi
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Aktifleştir
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Deaktifleştir
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Dışa Aktar
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teachers Table */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-2xl shadow-sm border overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers(filteredTeachers.map(t => t.id));
                        } else {
                          setSelectedTeachers([]);
                        }
                      }}
                      checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Öğretmen
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Branş & Deneyim
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Puan & İstatistikler
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Durum
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Kayıt Tarihi
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeachers([...selectedTeachers, teacher.id]);
                          } else {
                            setSelectedTeachers(selectedTeachers.filter(id => id !== teacher.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {teacher.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={teacher.avatar_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {teacher.profiles?.first_name?.charAt(0) || teacher.profiles?.last_name?.charAt(0) || teacher.email.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {teacher.profiles?.first_name && teacher.profiles?.last_name 
                              ? `${teacher.profiles.first_name} ${teacher.profiles.last_name}`.trim()
                              : teacher.profiles?.first_name || teacher.profiles?.last_name || 'İsimsiz Öğretmen'}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {teacher.email}
                          </div>
                          {teacher.phone && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                              {teacher.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {teacher.subject || 'Belirtilmemiş'}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {teacher.experience_years ? `${teacher.experience_years} yıl deneyim` : 'Deneyim belirtilmemiş'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 mb-1">
                        {teacher.rating ? getRatingStars(Math.round(teacher.rating)) : getRatingStars(0)}
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          ({teacher.rating?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                      <div className="flex space-x-4 text-xs">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-blue-500" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {teacher.total_students || 0} öğrenci
                          </span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1 text-green-500" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {teacher.total_lessons || 0} ders
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(teacher.status)}`}>
                        {teacher.status === 'active' ? 'Aktif' : 
                         teacher.status === 'inactive' ? 'Pasif' : 'Askıya Alınmış'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(teacher.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      {teacher.last_login && (
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                          Son: {new Date(teacher.last_login).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowTeacherModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) {
                              deleteUser(teacher.id).then(() => loadTeachers());
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredTeachers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Öğretmen bulunamadı
            </h3>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersManagement;