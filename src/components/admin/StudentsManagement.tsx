import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Trash2, Download, Filter, GraduationCap, BookOpen, Calendar, Clock } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  grade_level?: string;
  school?: string;
  parent_email?: string;
  parent_phone?: string;
  enrolled_courses?: number;
  completed_lessons?: number;
  total_study_time?: number;
  current_package?: string;
  package_expiry?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface StudentsManagementProps {
  darkMode: boolean;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({ darkMode }) => {
  const { getStudents, updateUser, deleteUser, loading } = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadStudents();
  }, [searchTerm, selectedFilter, gradeFilter, sortBy, sortOrder, currentPage]);

  const loadStudents = async () => {
    const result = await getStudents({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: selectedFilter === 'all' ? undefined : selectedFilter,
      sortBy: sortBy,
      sortOrder: sortOrder
    });
    
    if (result.success && result.students) {
      setStudents(result.students);
    }
  };

  const filteredStudents = students.filter(student => {
    // API'den gelen first_name ve last_name'i birleştir
    const fullName = student.profiles?.first_name && student.profiles?.last_name 
      ? `${student.profiles.first_name} ${student.profiles.last_name}`.trim()
      : student.profiles?.first_name || student.profiles?.last_name || 'İsimsiz Öğrenci';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.school?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
    const matchesGrade = gradeFilter === 'all' || student.grade_level?.toString() === gradeFilter;
    
    return matchesSearch && matchesFilter && matchesGrade;
  });

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'activate':
          for (const studentId of selectedStudents) {
            await updateUser(studentId, { status: 'active' });
          }
          break;
        case 'deactivate':
          for (const studentId of selectedStudents) {
            await updateUser(studentId, { status: 'inactive' });
          }
          break;
        case 'delete':
          for (const studentId of selectedStudents) {
            await deleteUser(studentId);
          }
          break;
        case 'export':
          exportData('csv');
          break;
      }
      setSelectedStudents([]);
      loadStudents();
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
    }
  };

  const exportData = (format: string) => {
    const data = filteredStudents.map(student => {
      const fullName = student.profiles?.first_name && student.profiles?.last_name 
        ? `${student.profiles.first_name} ${student.profiles.last_name}`.trim()
        : student.profiles?.first_name || student.profiles?.last_name || 'İsimsiz Öğrenci';
      
      return {
        'Ad Soyad': fullName,
        'E-posta': student.email,
        'Telefon': student.phone || '',
        'Sınıf': student.grade_level || '',
        'Okul': student.school || '',
        'Veli E-posta': student.parent_email || '',
        'Veli Telefon': student.parent_phone || '',
        'Kayıtlı Kurs': student.enrolled_courses || 0,
        'Tamamlanan Ders': student.completed_lessons || 0,
        'Çalışma Süresi': student.total_study_time ? `${Math.round(student.total_study_time / 60)} saat` : '0 saat',
        'Mevcut Paket': student.current_package || '',
        'Paket Bitiş': student.package_expiry ? new Date(student.package_expiry).toLocaleDateString('tr-TR') : '',
        'Durum': student.status === 'active' ? 'Aktif' : student.status === 'inactive' ? 'Pasif' : 'Askıya Alınmış',
        'Kayıt Tarihi': new Date(student.created_at).toLocaleDateString('tr-TR'),
        'Son Giriş': student.last_login ? new Date(student.last_login).toLocaleDateString('tr-TR') : 'Hiç'
      };
    });

    if (format === 'csv') {
      const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ogrenciler_${new Date().toISOString().split('T')[0]}.csv`;
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

  const getGradeColor = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 4) return 'bg-blue-100 text-blue-800';
    if (gradeNum <= 8) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  const formatStudyTime = (minutes: number) => {
    if (!minutes) return '0 dk';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const isPackageExpiring = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isPackageExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
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
                placeholder="Öğrenci ara..."
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
              <option value="all">Tüm Öğrenciler</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Tüm Sınıflar</option>
              <option value="1">1. Sınıf</option>
              <option value="2">2. Sınıf</option>
              <option value="3">3. Sınıf</option>
              <option value="4">4. Sınıf</option>
              <option value="5">5. Sınıf</option>
              <option value="6">6. Sınıf</option>
              <option value="7">7. Sınıf</option>
              <option value="8">8. Sınıf</option>
              <option value="9">9. Sınıf</option>
              <option value="10">10. Sınıf</option>
              <option value="11">11. Sınıf</option>
              <option value="12">12. Sınıf</option>
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
              <option value="grade_level">Sınıf</option>
              <option value="total_study_time">Çalışma Süresi</option>
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
              onClick={() => setShowStudentModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Yeni Öğrenci
            </button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">
                {selectedStudents.length} öğrenci seçildi
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

      {/* Students Table */}
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
                          setSelectedStudents(filteredStudents.map(s => s.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Öğrenci
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Sınıf & Okul
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    İstatistikler
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Paket Durumu
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={student.avatar_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.profiles?.first_name?.charAt(0) || student.profiles?.last_name?.charAt(0) || student.email.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {student.profiles?.first_name && student.profiles?.last_name 
                              ? `${student.profiles.first_name} ${student.profiles.last_name}`.trim()
                              : student.profiles?.first_name || student.profiles?.last_name || 'İsimsiz Öğrenci'}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {student.email}
                          </div>
                          {student.phone && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {student.grade_level && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(student.grade_level)}`}>
                            {student.grade_level}. Sınıf
                          </span>
                        )}
                      </div>
                      <div className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {student.school || 'Okul belirtilmemiş'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <BookOpen className="h-3 w-3 mr-1 text-green-500" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {student.enrolled_courses || 0} kurs
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <GraduationCap className="h-3 w-3 mr-1 text-blue-500" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {student.completed_lessons || 0} ders
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1 text-purple-500" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {formatStudyTime(student.total_study_time || 0)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.current_package ? (
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {student.current_package}
                          </div>
                          {student.package_expiry && (
                            <div className={`text-xs ${
                              isPackageExpired(student.package_expiry) ? 'text-red-600' :
                              isPackageExpiring(student.package_expiry) ? 'text-yellow-600' :
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {isPackageExpired(student.package_expiry) ? 'Süresi dolmuş' :
                               isPackageExpiring(student.package_expiry) ? 'Yakında dolacak' :
                               `${new Date(student.package_expiry).toLocaleDateString('tr-TR')} tarihine kadar`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Paket yok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status === 'active' ? 'Aktif' : 
                         student.status === 'inactive' ? 'Pasif' : 'Askıya Alınmış'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(student.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      {student.last_login && (
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                          Son: {new Date(student.last_login).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowStudentModal(true);
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
                            if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
                              deleteUser(student.id).then(() => loadStudents());
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
        
        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <GraduationCap className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Öğrenci bulunamadı
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

export default StudentsManagement;