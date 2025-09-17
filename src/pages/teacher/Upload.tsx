import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacher } from '@/hooks/useTeacher';
import { Upload as UploadIcon, File, Image, Video, FileText, X, Check, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
  category: 'document' | 'image' | 'video' | 'other';
  description?: string;
}

const TeacherUpload: React.FC = () => {
  const { user } = useAuth();
  const { loading, uploadDocument, removeFile } = useTeacher();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'document' | 'image' | 'video' | 'other'>('document');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load uploaded files from localStorage or API
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save uploaded files to localStorage
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);
        formData.append('description', description);

        await uploadDocument(file, selectedCategory, description);
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }
      
      setSelectedFiles([]);
      setDescription('');
      toast.success('Dosyalar başarıyla yüklendi');
    } catch (error) {
      console.error('Dosya yüklenirken hata:', error);
      toast.error('Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const result = await removeFile(fileId);
      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      }
    } catch (error) {
      console.error('Dosya silinirken hata:', error);
      toast.error('Dosya silinirken bir hata oluştu');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'document':
        return 'Doküman';
      case 'image':
        return 'Görsel';
      case 'video':
        return 'Video';
      default:
        return 'Diğer';
    }
  };

  const totalFiles = uploadedFiles.length;
  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
  const documentCount = uploadedFiles.filter(f => f.category === 'document').length;
  const imageCount = uploadedFiles.filter(f => f.category === 'image').length;
  const videoCount = uploadedFiles.filter(f => f.category === 'video').length;

  // Backend verilerini güncelle
  // useEffect(() => {
  //   if (files) {
  //     setUploadedFiles(files);
  //   }
  // }, [files]);

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
                  <UploadIcon className="h-6 w-6" />
                  <span>Dosya Yönetimi</span>
                </h1>
                <p className="text-gray-600">Ders materyallerini yükle ve yönet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Dosya</p>
                <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <File className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Boyut</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UploadIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dokümanlar</p>
                <p className="text-2xl font-bold text-gray-900">{documentCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medya</p>
                <p className="text-2xl font-bold text-gray-900">{imageCount + videoCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Image className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dosya Yükle</h2>
                
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="document">Doküman</option>
                    <option value="image">Görsel</option>
                    <option value="video">Video</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dosya hakkında kısa açıklama..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Dosyaları buraya sürükleyin veya
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    dosya seçin
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, PPT, JPG, PNG, MP4 (Maks. 50MB)
                  </p>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Seçilen Dosyalar</h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Yükleniyor...</span>
                      <span className="text-sm text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Yükleniyor...' : `${selectedFiles.length} Dosya Yükle`}
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Yüklenen Dosyalar</h2>
                
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz dosya yok</h3>
                    <p className="text-gray-600">İlk dosyanızı yükleyerek başlayın.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{file.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>{new Date(file.uploadDate).toLocaleDateString('tr-TR')}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(file.category)}`}>
                                {getCategoryName(file.category)}
                              </span>
                            </div>
                            {file.description && (
                              <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="İndir"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherUpload;