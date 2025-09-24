// API utility functions with authentication

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
};

// Create authenticated fetch request
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// API request wrapper with error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const token = getAuthToken();
    console.log('🔐 API Request:', url, 'Token available:', !!token);
    
    if (!token) {
      console.error('❌ No token available for API request');
      throw new Error('No token provided');
    }
    
    // Use relative URL for Vite proxy
    const fullUrl = url.startsWith('http') ? url : url;
    console.log('🌐 Full URL:', fullUrl);
    
    const response = await authenticatedFetch(fullUrl, options);
    console.log('📡 API Response:', fullUrl, 'Status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', fullUrl, 'Status:', response.status, 'Error:', data.error);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ API Success:', fullUrl);
    return { data, response };
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Specific API methods for classes
export const classesAPI = {
  getClasses: (params: URLSearchParams) => 
    apiRequest(`/api/admin/classes?${params}`),
    
  createClass: (classData: { name: string; grade_level: number; section: string }) =>
    apiRequest('/api/admin/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    }),
    
  updateClass: (id: string, classData: { name: string; grade_level: number; section: string }) =>
    apiRequest(`/api/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    }),
    
  deleteClass: (id: string) =>
    apiRequest(`/api/admin/classes/${id}`, {
      method: 'DELETE',
    }),
    
  getAvailableStudents: (params: URLSearchParams) =>
    apiRequest(`/api/admin/classes/students/available?${params}`),
    
  assignStudent: (assignmentData: { class_id: string; student_id: string; notes: string }) =>
    apiRequest('/api/admin/classes/students/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    }),
    
  removeStudent: (classId: string, studentId: string) =>
    apiRequest(`/api/admin/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    }),
};