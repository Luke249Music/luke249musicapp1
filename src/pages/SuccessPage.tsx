
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

export const SuccessPage = () => {
  const { user, login } = useAuth();

  const handleDemoLogin = () => {
    login('Demo User', 'demo@example.com');
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-20 flex flex-col items-center justify-center">
      <div className="animate-in zoom-in slide-in-from-bottom-8 duration-500 mb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-4 border-white dark:border-[#0f111a] shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-center">Request Submitted!</h1>
      <p className="text-lg text-gray-500 text-center max-w-lg mb-12">
        Your consultation request has been received and is pending admin approval. You will receive an email shortly once it is confirmed.
      </p>

      {user ? (
        <Link to="/dashboard" className="glass-panel hover:bg-white dark:hover:bg-gray-800 transition-colors p-6 rounded-2xl flex items-center gap-4 w-full max-w-sm group">
          <div className="bg-pink-100 dark:bg-pink-900/40 p-3 rounded-xl group-hover:bg-hot-pink-gradient transition-colors">
            <LayoutDashboard className="w-6 h-6 text-pink-500 group-hover:text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">My Schedule</h3>
            <p className="text-sm text-gray-500">Manage your bookings</p>
          </div>
        </Link>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
          <button onClick={handleDemoLogin} className="glass-panel hover:bg-white dark:hover:bg-gray-800 transition-colors p-6 rounded-2xl flex flex-col items-center text-center group cursor-pointer">
            <div className="bg-pink-100 dark:bg-pink-900/40 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-bold mb-1">Create Account</h3>
            <p className="text-sm text-gray-500">Save details for next time</p>
          </button>
          
          <button onClick={handleDemoLogin} className="glass-panel hover:bg-white dark:hover:bg-gray-800 transition-colors p-6 rounded-2xl flex flex-col items-center text-center group cursor-pointer">
            <div className="bg-purple-100 dark:bg-purple-900/40 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <LogIn className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-bold mb-1">Login Status</h3>
            <p className="text-sm text-gray-500">Already have an account?</p>
          </button>
        </div>
      )}
    </div>
  );
};
