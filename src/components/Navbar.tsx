
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CalendarDays, LogIn, LogOut, LayoutDashboard, Sun, Moon, CreditCard, Users } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-hot-pink-gradient p-2 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">ProSchedule</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
            </button>
            {user && !user.isAnonymous ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link to="/admin" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors hidden sm:flex">
                      <LayoutDashboard className="w-4 h-4" /> All Sessions
                    </Link>
                    <Link to="/admin/payments" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors hidden sm:flex">
                      <CreditCard className="w-4 h-4" /> Payments
                    </Link>
                    <Link to="/admin/clients" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors hidden sm:flex">
                      <Users className="w-4 h-4" /> Clients
                    </Link>
                    <Link to="/admin/availability" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors hidden sm:flex">
                      <CalendarDays className="w-4 h-4" /> Availability
                    </Link>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      My Schedule
                    </Link>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                  </>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-500 transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-sm font-medium hover:text-pink-500 transition-colors">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link to="/register" className="bg-hot-pink-gradient text-white px-5 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition-all shadow-md hover:shadow-lg">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
