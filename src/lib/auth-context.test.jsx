import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import { BrowserRouter } from 'react-router-dom';

// Mock the API calls
jest.mock('./api', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
  });

  it('handles login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
    const mockToken = 'mock-token';
    
    const { login } = require('./api');
    login.mockResolvedValueOnce({ ...mockUser, token: mockToken });

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Simulate login
    await act(async () => {
      const { login: loginFn } = useAuth();
      await loginFn('test@example.com', 'password');
    });

    expect(screen.getByTestId('user').textContent).toContain('test@example.com');
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
  });

  it('handles logout', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Simulate logout
    await act(async () => {
      const { logout: logoutFn } = useAuth();
      await logoutFn();
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
  });
}); 