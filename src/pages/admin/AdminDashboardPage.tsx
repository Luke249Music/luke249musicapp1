import { useScheduling, type Consultation } from '../../context/SchedulingContext';
import { format, isTomorrow, isPast, isToday, parse } from 'date-fns';
import { XCircle, Edit2, PlusCircle, CheckCircle2, Shield } from 'lucide-react';
import { useState } from 'react';

export const AdminDashboardPage = () => {
  const { consultations, bookConsultation, approveConsultation, rejectConsultation, updateConsultation } = useScheduling();
  
  const [showModal, setShowModal] = useState(false);
  const [manualSession, setManualSession] = useState({ name: '', email: '', date: '', time: '09:00 AM', type: 'regular' as 'regular' | 'emergency' });

  type ActionType = 'approve' | 'reject' | 'update' | null;
  const [actionModal, setActionModal] = useState<{ session: Consultation | null; type: ActionType }>({ session: null, type: null });
  const [emailBody, setEmailBody] = useState('');
  const [editSession, setEditSession] = useState<Partial<Consultation>>({});

  const openActionModal = (session: Consultation, type: ActionType) => {
    setActionModal({ session, type });
    setEditSession(session);
    if (type === 'approve') setEmailBody(`Hi ${session.name},\n\nYour appointment on ${session.date} at ${session.time} is confirmed.\n\nBest,\nAdmin`);
    else if (type === 'reject') setEmailBody(`Hi ${session.name},\n\nUnfortunately we cannot accommodate your appointment on ${session.date} at ${session.time}.\n\nBest,\nAdmin`);
    else setEmailBody(`Hi ${session.name},\n\nYour appointment details have been updated.\n\nBest,\nAdmin`);
  };

  const handleActionConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.session) return;
    if (actionModal.type === 'approve') approveConsultation(actionModal.session.id, emailBody);
    else if (actionModal.type === 'reject') rejectConsultation(actionModal.session.id, emailBody);
    else if (actionModal.type === 'update') updateConsultation(actionModal.session.id, editSession, emailBody);
    setActionModal({ session: null, type: null });
  };

  const parseDate = (dateStr: string) => parse(dateStr, 'yyyy-MM-dd', new Date());

  const past = consultations.filter(c => isPast(parseDate(c.date)) && !isToday(parseDate(c.date)));
  const tomorrow = consultations.filter(c => isTomorrow(parseDate(c.date)));
  const upcoming = consultations.filter(c => !isPast(parseDate(c.date)) && !isTomorrow(parseDate(c.date)) && !isToday(parseDate(c.date)));
  
  // also include today in upcoming
  const today = consultations.filter(c => isToday(parseDate(c.date)));
  const allUpcoming = [...today, ...upcoming];

  const handleCreateFreeEvent = (e: React.FormEvent) => {
    e.preventDefault();
    bookConsultation({
      type: manualSession.type,
      duration: 1, // Defaulting to 1h for manual events
      date: manualSession.date || format(new Date(), 'yyyy-MM-dd'),
      time: manualSession.time,
      name: manualSession.name,
      email: manualSession.email,
      needs: 'Manually Added Free Event',
      status: 'Confirmed'
    });
    setShowModal(false);
    setManualSession({ name: '', email: '', date: '', time: '09:00 AM', type: 'regular' });
  };



  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <span className="flex items-center gap-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Admin
            </span>
          </div>
          <p className="text-gray-500 mt-1">Manage global system consultations and bookings</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-hot-pink-gradient text-white px-5 py-2.5 rounded-full font-medium hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer">
          <PlusCircle className="w-5 h-5" /> Manual Free Add
        </button>
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
              {[
                ...tomorrow.map(s => ({ ...s, category: 'Tomorrow', dotClass: 'bg-pink-500 animate-pulse' })),
                ...allUpcoming.map(s => ({ ...s, category: 'Upcoming', dotClass: 'bg-blue-500' })),
                ...past.map(s => ({ ...s, category: 'Past', dotClass: 'bg-gray-400' }))
              ].map(session => (
                <tr key={session.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4 font-medium">
                    <div className="flex flex-col">
                      <span>{session.name}</span>
                      <span className="text-xs text-gray-400 font-normal">{session.needs}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                    {session.date} <span className="text-gray-400 ml-1">{session.time}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{session.type === 'emergency' ? 'Emergency' : 'Regular'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${session.dotClass}`}></span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.category}</span>
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
                            <CheckCircle2 className="w-5 h-5" />
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
              ))}
              {consultations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No sessions available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">Add Free Session</h2>
            <form onSubmit={handleCreateFreeEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input required type="text" value={manualSession.name} onChange={e => setManualSession({...manualSession, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Email</label>
                <input required type="email" value={manualSession.email} onChange={e => setManualSession({...manualSession, email: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input required type="date" value={manualSession.date} onChange={e => setManualSession({...manualSession, date: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <select required value={manualSession.time} onChange={e => setManualSession({...manualSession, time: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 font-medium text-white bg-hot-pink-gradient rounded-xl cursor-pointer hover:brightness-110 transition flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {actionModal.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 capitalize">{actionModal.type} Booking</h2>
            <form onSubmit={handleActionConfirm} className="space-y-4">
              
              {actionModal.type === 'update' && (
                 <>
                   <div>
                     <label className="block text-sm font-medium mb-1">Date</label>
                     <input required type="date" value={editSession.date || ''} onChange={e => setEditSession(prev => ({...prev, date: e.target.value}))} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium mb-1">Time</label>
                       <select value={editSession.time || ''} onChange={e => setEditSession(prev => ({...prev, time: e.target.value}))} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a] outline-none focus:border-pink-500">
                         {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
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
                <button type="button" onClick={() => setActionModal({ session: null, type: null })} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors cursor-pointer text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-hot-pink-gradient text-white rounded-xl font-medium hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                   {actionModal.type === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : actionModal.type === 'reject' ? <XCircle className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
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
