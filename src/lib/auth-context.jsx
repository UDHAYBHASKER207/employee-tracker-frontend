import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from './api';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext({
  user: null,
  login: async () => ({}),
  signup: async () => ({}),
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for existing token and load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Get employee data if user is an employee
          if (parsedUser.role === 'employee') {
            try {
              const employeeData = await api.getEmployee(parsedUser.employeeId || parsedUser._id, token);
              if (employeeData) {
                parsedUser.employeeData = employeeData;
                // Update firstName and lastName from employeeData for display in Navbar
                parsedUser.firstName = employeeData.firstName;
                parsedUser.lastName = employeeData.lastName;
              }
            } catch (error) {
              console.error('Error loading employee data:', error);
            }
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const token = response.token;
      
      // If user is an employee, fetch their employee data
      if (response.role === 'employee') {
        try {
          // First try to get employee by userId
          let employeeData = await api.getEmployees(token);
          employeeData = employeeData.find(
            emp => emp.userId === response._id
          );
          
          if (!employeeData) {
            throw new Error('No employee profile found');
          }
          
          // Add employee data to response
          response.employeeId = employeeData._id;
          response.employeeData = employeeData;
          // Update firstName and lastName from employeeData for consistent display
          response.firstName = employeeData.firstName;
          response.lastName = employeeData.lastName;
        } catch (error) {
          console.error('Error loading employee data:', error);
          throw new Error('Failed to load employee data. Please contact your administrator.');
        }
      }
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response));
      
      setUser(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData, password) => {
    try {
      const response = await api.signup(userData, password);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      setUser(response);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 