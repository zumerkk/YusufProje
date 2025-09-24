import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Edit, Trash2, Eye, GraduationCap, BookOpen, Calendar, Award } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  school: string;
  enrolledCourses: number;
  completedCourses: number;
  averageScore: number;
  joinDate: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  parentEmail?: string;
  parentPhone?: string;
  packageType: 'basic' | 'premium' | 'pro';
  packageExpiry: string;
}

interface StudentsManagementProps {
  className?: string;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({ className = '' }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'courses' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { getStudents: fetchStudentsFromAPI, loading: adminLoading } = useAdmin();

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const result = await fetchStudentsFromAPI();
      if (result.success && result.students) {
        // Transform API data to match component interface
        const transformedStudents = result.students.map((student: any) => ({
          id: student.id,
          name: student.profiles?.first_name && student.profiles?.last_name 
            ? `${student.profiles.first_name} ${student.profiles.last_name}` 
            : student.email,
          email: student.email,
          phone: student.phone || '',
          grade: student.student_profile?.grade_level || 'Belirtilmemiş',
          school: student.student_profile?.school_name || 'Belirtilmemiş',
          enrolledCourses: 0, // This would need to be calculated from lessons
          completedCourses: 0, // This would need to be calculated from lessons
          averageScore: 0, // This would need to be calculated from lesson results
          joinDate: student.created_at?.split('T')[0] || '',
          lastActivity: student.last_login?.split('T')[0] || student.created_at?.split('T')[0] || '',
          status: student.status || 'active',
          avatar: student.avatar_url,
          parentEmail: student.student_profile?.parent_name || '',
          parentPhone: student.student_profile?.parent_phone || '',
          packageType: 'basic', // This would need to be determined from student_packages
          packageExpiry: '2024-12-31' // This would need to be determined from student_packages
        }));
        setStudents(transformedStudents);
      } else {
        console.error('Failed to fetch students:', result.error);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Zeynep Kaya',
      email: 'zeynep.kaya@example.com',
      phone: '+90 532 111 2233',
      grade: '11. Sınıf',
      school: 'Atatürk Anadolu Lisesi',
      enrolledCourses: 5,
      completedCourses: 3,
      averageScore: 87.5,
      joinDate: '2023-09-15',
      lastActivity: '2024-01-15',
      status: 'active',
      parentEmail: 'parent.kaya@example.com',
      parentPhone: '+90 532 111 2234',
      packageType: 'premium',
      packageExpiry: '2024-06-15'
    },
    {
      id: '2',
      name: 'Can Özdemir',
      email: 'can.ozdemir@example.com',
      phone: '+90 533 444 5566',
      grade: '12. Sınıf',
      school: 'Fenerbahçe Lisesi',
      enrolledCourses: 8,
      completedCourses: 6,
      averageScore: 92.3,
      joinDate: '2023-08-20',
      lastActivity: '2024-01-14',
      status: 'active',
      parentEmail: 'parent.ozdemir@example.com',
      parentPhone: '+90 533 444 5567',
      packageType: 'pro',
      packageExpiry: '2024-08-20'
    },
    {
      id: '3',
      name: 'Elif Yılmaz',
      email: 'elif.yilmaz@example.com',
      phone: '+90 534 777 8899',
      grade: '10. Sınıf',
      school: 'Galatasaray Lisesi',
      enrolledCourses: 3,
      completedCourses: 1,
      averageScore: 78.9,
      joinDate: '2023-10-05',
      lastActivity: '2024-01-10',
      status: 'active',
      parentEmail: 'parent.yilmaz@example.com',
      parentPhone: '+90 534 777 8900',
      packageType: 'basic',
      packageExpiry: '2024-04-05'
    },
    {
      id: '4',
      name: 'Burak Demir',
      email: 'burak.demir@example.com',
      phone: '+90 535 123 4567',
      grade: '9. Sınıf',
      school: 'Beşiktaş Anadolu Lisesi',
      enrolledCourses: 4,
      completedCourses: 2,
      averageScore: 85.2,
      joinDate: '2023-11-12',
      lastActivity: '2024-01-12',
      status: 'inactive',
      parentEmail: 'parent.demir@example.com',
      parentPhone: '+90 535 123 4568',
      packageType: 'premium',
      packageExpiry: '2024-05-12'
    }
  ];

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.school.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchesPackage = filterPackage === 'all' || student.packageType === filterPackage;
      return matchesSearch && matchesGrade && matchesStatus && matchesPackage;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'score':
          aValue = a.averageScore;
          bValue = b.averageScore;
          break;
        case 'courses':
          aValue = a.enrolledCourses;
          bValue = b.enrolledCourses;
          break;
        case 'activity':
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setStudents(prev => prev.filter(student => student.id !== studentId));
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, studentIds: selectedStudents })
      });
      
      if (response.ok) {
        fetchStudents();
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'suspended': return 'Askıya Alınmış';
      default: return status;
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageText = (packageType: string) => {
    switch (packageType) {
      case 'basic': return 'Temel';
      case 'premium': return 'Premium';
      case 'pro': return 'Pro';
      default: return packageType;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Öğrenci Yönetimi</h2>
        <p className="text-gray-600">Sistemdeki öğrencileri görüntüleyin ve yönetin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Öğrenci</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0 ? (students.reduce((sum, s) => sum + s.averageScore, 0) / students.length).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bu Ay Katılan</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Sınıflar</option>
                <option value="9. Sınıf">9. Sınıf</option>
                <option value="10. Sınıf">10. Sınıf</option>
                <option value="11. Sınıf">11. Sınıf</option>
                <option value="12. Sınıf">12. Sınıf</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="suspended">Askıya Alınmış</option>
              </select>
              
              <select
                value={filterPackage}
                onChange={(e) => setFilterPackage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Paketler</option>
                <option value="basic">Temel</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Yeni Öğrenci
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Dışa Aktar
              </button>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedStudents.length} öğrenci seçildi
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Aktifleştir
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Pasifleştir
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öğrenci
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sınıf
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Okul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ortalama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurslar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.grade}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.school}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{student.averageScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {student.completedCourses}/{student.enrolledCourses}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageColor(student.packageType)}`}>
                      {getPackageText(student.packageType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
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
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Öğrenci bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsManagement;