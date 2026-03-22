
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScheduling } from '../context/SchedulingContext';
import { CalendarPlus, Calendar, Clock, Edit2, XCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { userBookings } = useScheduling();

  if (!user) {
    return <Navigate to="/" />;
  }

  // Find consultations for the logged-in user that are either Confirmed or Pending
  const userConsultations = userBookings.filter(c => 
    c.status === 'Confirmed' || c.status === 'Pending'
  );

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}</h1>
          <p className="text-gray-500">Manage your upcoming and past consultations.</p>
        </div>
        
        <Link to="/" className="bg-hot-pink-gradient text-white px-6 py-3 rounded-full font-semibold hover:brightness-110 shadow-lg shadow-pink-500/20 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer">
          <CalendarPlus className="w-5 h-5" />
          Schedule New Session
        </Link>
      </div>

      <div className="glass-panel p-8 rounded-3xl min-h-[400px]">
        <h2 className="text-xl font-bold mb-6">Upcoming Sessions</h2>
        
        {userConsultations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming sessions</h3>
            <p className="text-gray-500 max-w-md">You don't have any sessions scheduled right now. Click the button above to book your next consultation.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {userConsultations.map(session => (
              <div key={session.id} className="border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#1a1d2d]/50 p-6 rounded-2xl hover:border-pink-200 dark:hover:border-pink-900/50 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{session.type === 'emergency' ? 'Emergency' : 'Regular'} Consultation</div>
                      <div className="text-sm text-gray-500">
                        {session.slotId?.split('_')[0] || 'TBD'} at {session.slotId?.split('_')[1] || 'TBD'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    session.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                  }`}>
                    {session.status === 'Pending' ? 'Pending Approval' : session.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-300">Needs:</span> {session.needs}
                </p>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-center items-center gap-2 transition-colors cursor-pointer">
                    <Edit2 className="w-4 h-4" /> Reschedule
                  </button>
                  <button className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-pink-400 border border-red-100 dark:border-pink-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-pink-900/20 flex justify-center items-center gap-2 transition-colors cursor-pointer">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
