import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudent';
import { User, Mail, Phone, Calendar, BookOpen, Star, Edit2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileFormData {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  grade: string;
  school?: string;
  bio?: string;
  subjects?: string[];
  created_at?: string;
  updated_at?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, lessons, updateProfile, loading } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    grade: profile?.grade || '',
    school: profile?.school || '',
    bio: profile?.bio || ''
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        ...formData,
        id: profile?.id || '',
        subjects: profile?.subjects || [],
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
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
      grade: profile?.grade || '',
      school: profile?.school || '',
      bio: profile?.bio || ''
    });
    setIsEditing(false);
  };

  const completedLessons = lessons?.filter(lesson => lesson.status === 'completed') || [];
  const totalHours = completedLessons.reduce((total, lesson) => total + (lesson.duration_minutes / 60), 0);
  const averageRating = completedLessons.length > 0 
    ? completedLessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / completedLessons.length
    : 0;

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
                  <User className="h-6 w-6" />
                  <span>Profilim</span>
                </h1>
                <p className="text-gray-600">Kişisel bilgilerini yönet</p>
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
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

                  {/* Grade Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sınıf
                    </label>
                    {isEditing ? (
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Sınıf seçin</option>
                        <option value="9">9. Sınıf</option>
                        <option value="10">10. Sınıf</option>
                        <option value="11">11. Sınıf</option>
                        <option value="12">12. Sınıf</option>
                        <option value="university">Üniversite</option>
                        <option value="other">Diğer</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.grade || 'Belirtilmemiş'}</p>
                    )}
                  </div>

                  {/* School */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Okul
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Okul adı"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.school || 'Belirtilmemiş'}</p>
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

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
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
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Öğrenme İstatistikleri</h3>
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
                  <span className="text-gray-600 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Tamamlanan</span>
                  </span>
                  <span className="font-semibold text-green-600">{completedLessons.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Saat</span>
                  <span className="font-semibold text-purple-600">{totalHours.toFixed(1)} saat</span>
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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
              </div>
              <div className="p-6">
                {completedLessons.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {completedLessons.slice(0, 5).map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <span className="text-gray-900">{lesson.subject}</span>
                          <span className="text-gray-500 ml-2">
                            {new Date(lesson.lesson_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz tamamlanmış ders bulunmuyor</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;