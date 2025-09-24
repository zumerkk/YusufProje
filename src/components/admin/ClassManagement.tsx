import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Trash2, Users, BookOpen, GraduationCap, UserPlus, UserMinus, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { classesAPI } from '../../utils/api';

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  student_count: number;
  created_at: string;
  updated_at: string;
  class_students?: ClassStudent[];
}

interface ClassStudent {
  id: string;
  student_id: string;
  assigned_at: string;
  status: 'active' | 'inactive';
  notes?: string;
  students: {
    id: string;
    grade_level: string;
    school_name?: string;
    users: {
      id: string;
      email: string;
      profiles: {
        first_name?: string;
        last_name?: string;
      };
    };
  };
}

interface Student {
  id: string;
  email: string;
  profiles: {
    first_name?: string;
    last_name?: string;
  };
  students: {
    id: string;
    grade_level: string;
    school_name?: string;
  };
}

interface ClassManagementProps {
  darkMode: boolean;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ darkMode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: '',
    section: ''
  });

  useEffect(() => {
    loadClasses();
  }, [searchTerm, gradeFilter, currentPage]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(gradeFilter !== 'all' && { grade_level: gradeFilter })
      });

      const { data } = await classesAPI.getClasses(params);
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Load classes error:', error);
      toast.error('Sınıflar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async (gradeLevel?: number) => {
    try {
      const params = new URLSearchParams();
      if (gradeLevel) {
        params.append('grade_level', gradeLevel.toString());
      }

      const { data } = await classesAPI.getAvailableStudents(params);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Load students error:', error);
      toast.error('Öğrenciler yüklenirken hata oluştu');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await classesAPI.createClass({
        name: formData.name,
        grade_level: parseInt(formData.grade_level),
        section: formData.section
      });

      toast.success('Sınıf başarıyla oluşturuldu');
      setShowClassModal(false);
      setFormData({ name: '', grade_level: '', section: '' });
      loadClasses();
    } catch (error) {
      console.error('Create class error:', error);
      toast.error('Sınıf oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setLoading(true);
    try {
      await classesAPI.updateClass(selectedClass.id, {
        name: formData.name,
        grade_level: parseInt(formData.grade_level),
        section: formData.section
      });

      toast.success('Sınıf başarıyla güncellendi');
      setShowClassModal(false);
      setSelectedClass(null);
      setFormData({ name: '', grade_level: '', section: '' });
      loadClasses();
    } catch (error) {
      console.error('Update class error:', error);
      toast.error('Sınıf güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Bu sınıfı silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      await classesAPI.deleteClass(classId);
      toast.success('Sınıf başarıyla silindi');
      loadClasses();
    } catch (error) {
      console.error('Delete class error:', error);
      toast.error('Sınıf silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentUserId: string) => {
    if (!selectedClassForStudents) return;

    setLoading(true);
    try {
      // Student user ID'sinden student record ID'sini bul
      const student = students.find(s => s.id === studentUserId);
      let studentRecordId = '';
      
      if (Array.isArray(student?.students) && student.students.length > 0) {
        studentRecordId = student.students[0].id;
      } else if (student?.students && typeof student.students === 'object') {
        studentRecordId = student.students.id;
      }
      
      if (!studentRecordId) {
        toast.error('Öğrenci kaydı bulunamadı');
        return;
      }

      await classesAPI.assignStudent({
        class_id: selectedClassForStudents.id,
        student_id: studentRecordId,
        notes: ''
      });
      toast.success('Öğrenci başarıyla sınıfa atandı');
      loadClasses();
      loadAvailableStudents(selectedClassForStudents.grade_level);
    } catch (error) {
      console.error('Assign student error:', error);
      toast.error('Öğrenci atanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    if (!confirm('Bu öğrenciyi sınıftan çıkarmak istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      await classesAPI.removeStudent(classId, studentId);
      toast.success('Öğrenci başarıyla sınıftan çıkarıldı');
      loadClasses();
    } catch (error) {
      console.error('Remove student error:', error);
      toast.error('Öğrenci çıkarılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedClass(null);
    setFormData({ name: '', grade_level: '', section: '' });
    setShowClassModal(true);
  };

  const openEditModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      grade_level: classItem.grade_level.toString(),
      section: classItem.section
    });
    setShowClassModal(true);
  };

  const openStudentModal = (classItem: Class) => {
    setSelectedClassForStudents(classItem);
    setShowStudentModal(true);
    loadAvailableStudents(classItem.grade_level);
  };

  const getGradeColor = (grade: number) => {
    if (grade <= 4) return 'bg-blue-100 text-blue-800';
    if (grade <= 8) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getStudentName = (student: any) => {
    // ClassStudent için (sınıftaki öğrenciler)
    if (student.students?.users?.profiles) {
      const firstName = student.students.users.profiles.first_name;
      const lastName = student.students.users.profiles.last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'İsimsiz Öğrenci';
    }
    // Available students için (atanabilir öğrenciler)
    else if (Array.isArray(student.profiles) && student.profiles.length > 0) {
      const firstName = student.profiles[0].first_name;
      const lastName = student.profiles[0].last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'İsimsiz Öğrenci';
    }
    // Tek profil objesi için
    else if (student.profiles && !Array.isArray(student.profiles)) {
      const firstName = student.profiles.first_name;
      const lastName = student.profiles.last_name;
      return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'İsimsiz Öğrenci';
    }
    
    return 'İsimsiz Öğrenci';
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || classItem.grade_level.toString() === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const availableStudentsForClass = students.filter(student => {
    if (!selectedClassForStudents) return true;
    
    // API'den gelen veri yapısına göre grade_level'ı kontrol et
    let studentGradeNumber = 0;
    
    // Eğer student.students array ise ilk elemanı al
    if (Array.isArray(student.students) && student.students.length > 0) {
      const gradeLevel = student.students[0].grade_level;
      if (typeof gradeLevel === 'string') {
        studentGradeNumber = parseInt(gradeLevel.match(/\d+/)?.[0] || '0');
      } else if (typeof gradeLevel === 'number') {
        studentGradeNumber = gradeLevel;
      }
    }
    // Eğer student.students object ise direkt kullan
    else if (student.students && typeof student.students === 'object') {
      const gradeLevel = student.students.grade_level;
      if (typeof gradeLevel === 'string') {
        studentGradeNumber = parseInt(gradeLevel.match(/\d+/)?.[0] || '0');
      } else if (typeof gradeLevel === 'number') {
        studentGradeNumber = gradeLevel;
      }
    }
    
    return studentGradeNumber === selectedClassForStudents.grade_level;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Sınıf Yönetimi
          </h2>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sınıfları yönetin ve öğrencileri sınıflara atayın
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Sınıf
        </button>
      </div>

      {/* Search and Filters */}
      <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Sınıf ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">Tüm Seviyeler</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade.toString()}>{grade}. Sınıf</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border animate-pulse`}>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-300 rounded flex-1"></div>
                <div className="h-8 bg-gray-300 rounded w-8"></div>
                <div className="h-8 bg-gray-300 rounded w-8"></div>
              </div>
            </div>
          ))
        ) : filteredClasses.length === 0 ? (
          <div className={`col-span-full bg-white ${darkMode ? 'bg-gray-800' : ''} p-12 rounded-2xl shadow-sm border text-center`}>
            <BookOpen className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Henüz sınıf bulunmuyor
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              İlk sınıfınızı oluşturmak için "Yeni Sınıf" butonuna tıklayın.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Yeni Sınıf Oluştur
            </button>
          </div>
        ) : (
          filteredClasses.map((classItem) => (
            <div key={classItem.id} className={`bg-white ${darkMode ? 'bg-gray-800' : ''} p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {classItem.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(classItem.grade_level)}`}>
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {classItem.grade_level}. Sınıf
                    </span>
                    {classItem.section && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${darkMode ? 'bg-gray-700 text-gray-300' : ''}`}>
                        {classItem.section}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {classItem.student_count} öğrenci
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openStudentModal(classItem)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Öğrenci Ata
                </button>
                <button
                  onClick={() => openEditModal(classItem)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClass(classItem.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Students List */}
              {classItem.class_students && classItem.class_students.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sınıftaki Öğrenciler:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {classItem.class_students
                      .filter(cs => cs.status === 'active')
                      .slice(0, 3)
                      .map((classStudent) => (
                        <div key={classStudent.id} className="flex items-center justify-between">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getStudentName(classStudent)}
                          </span>
                          <button
                            onClick={() => handleRemoveStudent(classItem.id, classStudent.student_id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <UserMinus className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    }
                    {classItem.class_students.filter(cs => cs.status === 'active').length > 3 && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        +{classItem.class_students.filter(cs => cs.status === 'active').length - 3} öğrenci daha
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-2xl p-6 w-full max-w-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedClass ? 'Sınıf Düzenle' : 'Yeni Sınıf Oluştur'}
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={selectedClass ? handleUpdateClass : handleCreateClass} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sınıf Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Örn: Matematik A"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sınıf Seviyesi
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Seviye seçin</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade.toString()}>{grade}. Sınıf</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Şube (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Örn: A, B, C"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : selectedClass ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Assignment Modal */}
      {showStudentModal && selectedClassForStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white ${darkMode ? 'bg-gray-800' : ''} rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedClassForStudents.name} - Öğrenci Ata
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedClassForStudents.grade_level}. sınıf seviyesindeki uygun öğrenciler:
              </p>
            </div>

            <div className="overflow-y-auto max-h-96">
              {availableStudentsForClass.length === 0 ? (
                <div className="text-center py-8">
                  <Users className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bu seviyede uygun öğrenci bulunamadı
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableStudentsForClass.map((student) => (
                    <div key={student.id} className={`flex items-center justify-between p-3 border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getStudentName(student)}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {student.email} • {
                            Array.isArray(student.students) && student.students.length > 0 
                              ? student.students[0].grade_level 
                              : student.students?.grade_level || 'Seviye belirtilmemiş'
                          }
                        </p>
                        {((Array.isArray(student.students) && student.students.length > 0 && student.students[0].school_name) || 
                          (student.students?.school_name)) && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {Array.isArray(student.students) && student.students.length > 0 
                              ? student.students[0].school_name 
                              : student.students?.school_name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAssignStudent(student.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Ata
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;