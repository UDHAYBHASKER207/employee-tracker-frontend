import { toast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5000/api';

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON (e.g., HTML error page), use status text
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
    }
    const error = errorData.message || response.statusText;
    throw new Error(error);
  }
  
  try {
    return await response.json();
  } catch (e) {
    // If response is OK but not JSON (e.g., empty 200 OK), handle gracefully
    return {};
  }
};

// Auth API calls
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signup = async (userData, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        password: password || userData.password
      }),
    });
    
    const data = await handleResponse(response);
    if (!data) {
      throw new Error('No data received from server');
    }
    return data;
  } catch (error) {
    console.error('Signup API error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  // Just clear the token from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return true;
};

// Helper to check for JWT expiry in API responses
export function handleApiError(error, logout, navigate) {
  if (error?.response?.status === 401 && error?.response?.data?.message === 'jwt expired') {
    logout();
    if (navigate) navigate('/login');
    return true;
  }
  return false;
}

// Employee API calls
export const getEmployees = async (token) => {
  try {
    const response = await fetch(`${API_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getEmployee = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addEmployee = async (employeeData, token) => {
  try {
    // Get token from localStorage if not provided
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      throw new Error('Authentication required');
    }

    // Check if we have an image file to upload
    if (employeeData.image && typeof employeeData.image === 'object') {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all employee data to FormData
      Object.keys(employeeData).forEach(key => {
        if (key === 'image') {
          formData.append('image', employeeData.image);
        } else {
          formData.append(key, employeeData[key]);
        }
      });
      
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
      
      return handleResponse(response);
    } else {
      // Regular JSON request without file upload
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(employeeData),
      });
      
      return handleResponse(response);
    }
  } catch (error) {
    console.error('Add employee error:', error);
    throw new Error(error.message || 'Failed to add employee');
  }
};

export const updateEmployee = async (id, employeeData, token) => {
  try {
    console.log('updateEmployee called with:', { id, employeeData });
    
    // Check if we have an image file to upload
    if (employeeData instanceof FormData) {
      console.log('Using FormData for update');
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: employeeData,
      });
      
      const result = await handleResponse(response);
      console.log('Update response:', result);
      return result;
    } else {
      console.log('Using JSON for update');
      // Regular JSON request without file upload
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });
      
      const result = await handleResponse(response);
      console.log('Update response:', result);
      return result;
    }
  } catch (error) {
    console.error('Update employee error:', error);
    throw new Error(error.message || 'Failed to update employee');
  }
};

export const deleteEmployee = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCurrentEmployee = async (token) => {
  const response = await fetch(`${API_URL}/employees/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

// Department and position helpers
export const departments = [
  { id: '1', name: 'Engineering', description: 'Software development and technical operations' },
  { id: '2', name: 'Marketing', description: 'Brand management and customer acquisition' },
  { id: '3', name: 'Human Resources', description: 'Personnel management and recruitment' },
  { id: '4', name: 'Finance', description: 'Financial operations and accounting' },
  { id: '5', name: 'Sales', description: 'Revenue generation and client relations' },
  { id: '6', name: 'Operations', description: 'Business processes and logistics' },
  { id: '7', name: 'Customer Support', description: 'Customer service and assistance' },
];

export const positions = [
  { id: '1', name: 'Software Engineer', department: '1' },
  { id: '2', name: 'Senior Software Engineer', department: '1' },
  { id: '3', name: 'Product Manager', department: '1' },
  { id: '4', name: 'Marketing Specialist', department: '2' },
  { id: '5', name: 'Marketing Manager', department: '2' },
  { id: '6', name: 'HR Coordinator', department: '3' },
  { id: '7', name: 'HR Manager', department: '3' },
  { id: '8', name: 'Accountant', department: '4' },
  { id: '9', name: 'Financial Analyst', department: '4' },
  { id: '10', name: 'Sales Representative', department: '5' },
  { id: '11', name: 'Sales Manager', department: '5' },
  { id: '12', name: 'Operations Coordinator', department: '6' },
  { id: '13', name: 'Operations Manager', department: '6' },
  { id: '14', name: 'Customer Support Representative', department: '7' },
  { id: '15', name: 'Customer Support Manager', department: '7' },
];

export const getDepartmentName = (id) => {
  return departments.find(d => d.id === id)?.name || '';
};

/**
 * @param {string} id
 * @returns {string}
 */
export const getPositionName = (id) => {
  return positions.find(p => p.id === id)?.name || '';
};

// Attendance API call
export const getAttendance = async (employeeId, token) => {
  try {
    const response = await fetch(`${API_URL}/attendance/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTasks = async (employeeId, token) => {
  const url = employeeId ? `${API_URL}/tasks?assignedTo=${employeeId}` : `${API_URL}/tasks`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const updateTask = async (taskId, data, token) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const checkIn = async (employeeId, token) => {
  const response = await fetch(`${API_URL}/attendance/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ employeeId }),
  });
  return handleResponse(response);
};

export const checkOut = async (employeeId, token) => {
  const response = await fetch(`${API_URL}/attendance/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ employeeId }),
  });
  return handleResponse(response);
};

export const getAnnouncements = async (token) => {
    const response = await fetch(`${API_URL}/announcements`, {
      headers: {
      'Authorization': `Bearer ${token}`
    }
    });
  if (!response.ok) throw new Error('Failed to fetch announcements');
  const data = await response.json();
  return data.data;
};

export const createAnnouncement = async (announcementData, token) => {
    const response = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
      },
    body: JSON.stringify(announcementData)
  });
  if (!response.ok) throw new Error('Failed to create announcement');
  const data = await response.json();
  return data.data;
};

export const deleteAnnouncement = async (id, token) => {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete announcement');
  return true;
};

export const getActivities = async (employeeId, token) => {
  try {
    const response = await fetch(`${API_URL}/activities/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @param {string} token
 * @returns {Promise<import('./types').Project[]>}
 */
export const getProjects = async (token) => {
  const response = await fetch(`${API_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
};
