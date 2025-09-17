import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacher } from '@/hooks/useTeacher';
import { User, Mail, Phone, DollarSign, BookOpen, Star, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  hourly_rate?: number;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  subjects?: string[];
}

const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, lessons, updateProfile, loading } = useTeacher();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    hourly_rate: profile?.hourly_rate || 0,
    experience_years: profile?.experience_years || 0,
    education: profile?.education || '',
    certifications: profile?.certifications || [],
    subjects: profile?.subjects || []
  });
  const [saving, setSaving] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const availableSubjects = [
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
    'Tarih', 'Coğrafya', 'İngilizce', 'Almanca', 'Fransızca', 'Felsefe'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'hourly_rate' || name === 'experience_years' ? Number(value) : value 
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addSubject = () => {
    if (newSubject && !formData.subjects?.includes(newSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...(prev.subjects || []), newSubject]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects?.filter(s => s !== subject) || []
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      hourly_rate: profile?.hourly_rate || 0,
      experience_years: profile?.experience_years || 0,
      education: profile?.education || '',
      certifications: profile?.certifications || [],
      subjects: profile?.subjects || []
    });
    setIsEditing(false);
  };

  const completedLessons = lessons?.filter(lesson => lesson.status === 'completed') || [];
  const totalHours = completedLessons.reduce((total, lesson) => total + (lesson.duration_minutes / 60), 0);
  const averageRating = completedLessons.length > 0 
    ? completedLessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / completedLessons.length
    : 0;
  const totalEarnings = completedLessons.reduce((total, lesson) => total + (lesson.price || 0), 0);

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
                  <span>Profilim</span>
                </h1>
                <p className="text-gray-600">Öğretmen bilgilerini yönet</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ad Soyad"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.full_name || 'Belirtilmemiş'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <p className="text-gray-900 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user?.email}</span>
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Telefon numarası"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{profile?.phone || 'Belirtilmemiş'}</span>
                      </p>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saatlik Ücret (₺)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Saatlik ücret"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{profile?.hourly_rate || 0}₺</span>
                      </p>
                    )}
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deneyim (Yıl)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Deneyim yılı"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.experience_years || 0} yıl</p>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eğitim
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Eğitim bilgisi"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.education || 'Belirtilmemiş'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hakkımda
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.bio || 'Henüz bir açıklama eklenmemiş.'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Verdiğim Dersler</h2>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Ders seçin</option>
                        {availableSubjects
                          .filter(subject => !formData.subjects?.includes(subject))
                          .map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                      </select>
                      <button
                        onClick={addSubject}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.subjects?.map(subject => (
                        <span
                          key={subject}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          <span>{subject}</span>
                          <button
                            onClick={() => removeSubject(subject)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.subjects?.length ? (
                      profile.subjects.map(subject => (
                        <span
                          key={subject}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Henüz ders eklenmemiş</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sertifikalar</h2>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Sertifika adı"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <button
                        onClick={addCertification}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.certifications?.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{cert}</span>
                          <button
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.certifications?.length ? (
                      profile.certifications.map((cert, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{cert}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Henüz sertifika eklenmemiş</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>İptal</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Teaching Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Öğretmenlik İstatistikleri</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Toplam Ders</span>
                  </span>
                  <span className="font-semibold text-gray-900">{lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tamamlanan</span>
                  <span className="font-semibold text-green-600">{completedLessons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Saat</span>
                  <span className="font-semibold text-purple-600">{totalHours.toFixed(1)} saat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Kazanç</span>
                  <span className="font-semibold text-green-600">{totalEarnings.toLocaleString('tr-TR')}₺</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>Ortalama Puan</span>
                    </span>
                    <span className="font-semibold text-yellow-600">{averageRating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Son Değerlendirmeler</h3>
              </div>
              <div className="p-6">
                {completedLessons.filter(l => l.review).slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {completedLessons.filter(l => l.review).slice(0, 3).map(lesson => (
                      <div key={lesson.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (lesson.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{lesson.subject}</span>
                        </div>
                        <p className="text-sm text-gray-700">{lesson.review}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz değerlendirme bulunmuyor</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;