import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Users, UserCircle, Menu, X, LogOut, ClipboardList, CalendarClock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 backdrop-blur-lg bg-opacity-80 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-primary font-semibold text-xl transition-transform duration-300 hover:scale-105"
        >
          <Users className="h-6 w-6" />
          <span>EmployeeTracker</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary transition-colors duration-300"
              >
                Log in
              </Link>
              <Link to="/signup">
                <Button variant="default" className="animate-scale-in">Sign up</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              {isAdmin && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/employees" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300"
                  >
                    Employees
                  </Link>
                  <Link 
                    to="/admin/assign-task" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300 flex items-center"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Assign Task
                  </Link>
                  <Link 
                    to="/admin/projects" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300 flex items-center"
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Projects
                  </Link>
                </>
              )}
              {isEmployee && (
                <>
                  <Link 
                    to="/employee/dashboard" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/employee/profile" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/employee/attendance" 
                    className="text-gray-700 hover:text-primary transition-colors duration-300"
                  >
                    Attendance
                  </Link>
                </>
              )}
              <div className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">{user.firstName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center space-x-1 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700 hover:text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full bg-white border-b border-gray-100 animate-slide-down">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary py-2 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="default" className="w-full">Sign up</Button>
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <>
                    <Link 
                      to="/admin/dashboard" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin/employees" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Employees
                    </Link>
                    <Link 
                      to="/admin/assign-task" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Assign Task
                    </Link>
                    <Link 
                      to="/admin/projects" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Projects
                    </Link>
                  </>
                )}
                {isEmployee && (
                  <>
                    <Link 
                      to="/employee/dashboard" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/employee/profile" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/employee/attendance" 
                      className="text-gray-700 hover:text-primary py-2 transition-colors duration-300 flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Attendance
                    </Link>
                  </>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="justify-center flex items-center space-x-2 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 