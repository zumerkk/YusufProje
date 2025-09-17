import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logoIcon from '../assets/logo-icon.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();



  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Eğitim Paketleri', href: '/packages' },
    { label: 'Neden Biz', href: '/why-us' },
    { label: 'Hakkımızda', href: '/about' },
  ];

  const getDashboardLink = () => {
    if (!user?.role) return '/dashboard';
    
    switch (user.role) {
      case 'student':
        return '/student-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logoIcon} 
                alt="Atlas Derslik" 
                className="h-12 w-12"
              />
              <span className="text-xl font-bold text-blue-600">
                Atlas Derslik
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {!loading && (
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıkış</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {!loading && (
              <div className="border-t pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center space-x-2 text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Çıkış</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="bg-orange-500 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-orange-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;