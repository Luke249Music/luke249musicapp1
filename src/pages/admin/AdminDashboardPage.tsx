import { parseISO, isAfter } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, CalendarCheck, Edit2 } from 'lucide-react';
import { db } from '../../firebase';
import { useScheduling, type Booking } from '../../context/SchedulingContext';
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';


export const AdminDashboardPage = () => {
  const { approveConsultation, rejectConsultation, updateConsultation } = useScheduling();
  
  const [consultations, setConsultations] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  type ActionType = 'approve' | 'reject' | 'update' | null;
  const [actionModal, setActionModal] = useState<{ session: Booking | null; type: ActionType }>({ session: null, type: null });
  const [emailBody, setEmailBody] = useState('');
  const [editSession, setEditSession] = useState<Partial<Booking>>({});
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, 'bookings'), (snapshot) => {
      const dbBookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        dbBookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
      });
      setConsultations(dbBookings);
    });
    return () => unsub();
  }, []);

  const openActionModal = (session: Booking, type: ActionType) => {
    setActionModal({ session, type });
    const slotParts = session.slotId?.split('_') || ['N/A', 'N/A'];
    const pDate = slotParts[0];
    const pTime = slotParts[1];
    
    if (type === 'approve') setEmailBody(`Hi ${session.name},\n\nYour appointment on ${pDate} at ${pTime} is confirmed.\n\nBest,\nAdmin`);
    else if (type === 'reject') setEmailBody(`Hi ${session.name},\n\nUnfortunately we cannot accommodate your appointment on ${pDate} at ${pTime}.\n\nBest,\nAdmin`);
    else setEmailBody(`Hi ${session.name},\n\nYour appointment details have been updated.\n\nBest,\nAdmin`);
  };

  const handleActionConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.session || !actionModal.session.createdBy) return;
    const { id, createdBy } = actionModal.session;

    if (actionModal.type === 'approve') await approveConsultation(createdBy, id, emailBody);
    else if (actionModal.type === 'reject') await rejectConsultation(createdBy, id, emailBody);
    else if (actionModal.type === 'update') await updateConsultation(createdBy, id, editSession, emailBody);
    setActionModal({ session: null, type: null });
  };

  const filteredConsultations = consultations.filter(session => {
    const textLower = searchText.toLowerCase();
    const matchesSearch = searchText === '' ||
                 session.name.toLowerCase().includes(textLower) || 
                 session.email.toLowerCase().includes(textLower) ||
                 (session.slotId && session.slotId.includes(textLower));

    const matchesFilter = filter === 'all' || session.status.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <span className="flex items-center gap-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
              <CalendarCheck className="w-3.5 h-3.5" /> Admin
            </span>
          </div>
          <p className="text-gray-500 mt-1">Manage global system consultations and bookings</p>
        </div>
        {/* Manual Free Add button removed as per instruction */}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, email, or slot ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'confirmed')}
          className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Date & Time</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.map(session => {
                const slotParts = session.slotId?.split('_') || ['N/A', 'N/A'];
                const bDate = slotParts[0];
                const bTime = slotParts[1];
                
                // Determine category based on date (simplified as per instruction's removal of date-fns functions)
                // For now, we'll just use a generic 'Upcoming' or 'Past' if we don't have the full date-fns logic
                const now = new Date();
                const pDate = parseISO(slotParts[0] || now.toISOString());
                const isUpcoming = isAfter(pDate, now); // Simplified logic
                const category = isUpcoming ? 'Upcoming' : 'Past';
                const dotClass = isUpcoming ? 'bg-blue-500' : 'bg-gray-400';

                return (
                <tr key={session.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4 font-medium">
                    <div className="flex flex-col">
                      <span>{session.name}</span>
                      <span className="text-xs text-gray-400 font-normal">{session.needs}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-500 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium">{bDate}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {bTime}
                        </p>
                      </div>
                  </div>
                  </td>
                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{session.type === 'emergency' ? 'Emergency' : 'Regular'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {session.paymentMethod === 'later' && session.status !== 'Rejected' ? (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap border border-amber-200 dark:border-amber-800 shadow-sm mb-2 block w-max">
                        Collect Payment
                      </span>
                    ) : null}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      session.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      session.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      session.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {session.status === 'Pending' && (
                        <>
                          <button onClick={() => openActionModal(session, 'approve')} className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer" title="Confirm">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => openActionModal(session, 'reject')} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer" title="Reject">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      <button onClick={() => openActionModal(session, 'update')} className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      {session.status !== 'Pending' && session.status !== 'Rejected' && (
                         <button 
                           onClick={() => openActionModal(session, 'reject')}
                           className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer" title="Cancel/Reject">
                           <XCircle className="w-5 h-5" />
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
              {consultations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No sessions available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {actionModal.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 capitalize">{actionModal.type} Booking</h2>
            <form onSubmit={handleActionConfirm} className="space-y-4">
              
              {actionModal.type === 'update' && (
                 <>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium mb-1">Type</label>
                       <select value={editSession.type || 'regular'} onChange={e => setEditSession(prev => ({...prev, type: e.target.value as 'regular' | 'emergency'}))} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500">
                         <option value="regular">Regular</option>
                         <option value="emergency">Emergency</option>
                       </select>
                     </div>
                   </div>
                 </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Email Notification Preview</label>
                <textarea 
                  required 
                  value={emailBody} 
                  onChange={e => setEmailBody(e.target.value)} 
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500 min-h-[150px]"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">This email will be sent to the client upon save.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setActionModal({ session: null, type: null })} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
                   {actionModal.type === 'approve' ? <CheckCircle className="w-5 h-5" /> : actionModal.type === 'reject' ? <XCircle className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                   Send & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
