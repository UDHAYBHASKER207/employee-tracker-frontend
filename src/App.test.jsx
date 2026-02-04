import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth-context';

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('App', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
  });

  it('renders the home page by default', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/Welcome to TrackHive/i)).toBeInTheDocument();
  });

  it('renders the login page when navigating to /login', () => {
    window.history.pushState({}, '', '/login');
    renderWithRouter(<App />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders the signup page when navigating to /signup', () => {
    window.history.pushState({}, '', '/signup');
    renderWithRouter(<App />);
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });
}); 