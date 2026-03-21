import { useAuth } from '../../context/AuthContext';
import { useScheduling } from '../../context/SchedulingContext';
import { Mail, Edit2, Trash2, Check, X, AlertTriangle, ShieldBan, ShieldCheck, CalendarPlus, Plus } from 'lucide-react';
import { useState } from 'react';

export const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient, toggleClientStatus } = useAuth();
  const { bookConsultation } = useScheduling();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [addClientForm, setAddClientForm] = useState({ name: '', email: '' });

  const [schedulingClient, setSchedulingClient] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '09:00 AM',
    type: 'regular' as 'regular' | 'emergency',
    needs: 'Admin scheduled session'
  });

  const startEdit = (client: any) => {
    setEditingId(client.id);
    setEditForm({ name: client.name, email: client.email });
  };

  const handleSave = (id: string) => {
    updateClient(id, editForm.name, editForm.email);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteClient(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Directory</h1>
          <p className="text-gray-500">Manage all registered users on your platform</p>
        </div>
        <button 
          onClick={() => setIsAddingClient(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-pink-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Client Info</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Joined Date</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Total Sessions</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const isEditing = editingId === client.id;
                
                return (
                  <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-hot-pink-gradient rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        {isEditing ? (
                          <input 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-1.5 text-sm rounded-lg border border-pink-300 dark:border-pink-700 bg-white dark:bg-[#0f111a] focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        ) : (
                          <span className="font-medium">{client.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input 
                          value={editForm.email} 
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full p-1.5 text-sm rounded-lg border border-pink-300 dark:border-pink-700 bg-white dark:bg-[#0f111a] focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                      ) : (
                        <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 transition-colors">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{client.joinedDate}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1 rounded-full text-xs font-medium">
                        {client.totalSessions} Sessions
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {client.status === 'revoked' ? (
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(client.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setSchedulingClient(client)}
                              title="Schedule Session"
                              className="p-1.5 text-pink-500 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-900/30 rounded-lg transition-colors cursor-pointer"
                            >
                              <CalendarPlus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleClientStatus(client.id)}
                              title={client.status === 'revoked' ? "Restore Access" : "Revoke Access"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                client.status === 'revoked' 
                                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30' 
                                  : 'text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30'
                              }`}>
                              {client.status === 'revoked' ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                            </button>
                            <button onClick={() => startEdit(client)} className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer" title="Edit Client">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingId(client.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer" title="Delete Client">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-sm bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Delete Client?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              This action cannot be undone. This will permanently remove the client and all associated session metrics from the system.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddingClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Client</h2>
              <button 
                onClick={() => setIsAddingClient(false)} 
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              addClient(addClientForm.name, addClientForm.email);
              setAddClientForm({ name: '', email: '' });
              setIsAddingClient(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={addClientForm.name}
                  onChange={e => setAddClientForm({...addClientForm, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={addClientForm.email}
                  onChange={e => setAddClientForm({...addClientForm, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/20 transition-all active:scale-[0.98] cursor-pointer">
                Create Client
              </button>
            </form>
          </div>
        </div>
      )}

      {schedulingClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Schedule Session</h2>
              <button 
                onClick={() => setSchedulingClient(null)} 
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-900/50">
              <p className="text-sm text-pink-800 dark:text-pink-300 font-medium">Booking for: <span className="font-bold">{schedulingClient.name}</span></p>
              <p className="text-sm text-pink-600 dark:text-pink-400 flex items-center gap-1 mt-1"><Mail className="w-3 h-3"/> {schedulingClient.email}</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              bookConsultation({
                type: scheduleForm.type,
                duration: 1,
                date: scheduleForm.date,
                time: scheduleForm.time,
                name: schedulingClient.name,
                email: schedulingClient.email,
                needs: scheduleForm.needs,
                status: 'Confirmed',
                paymentMethod: 'later'
              });
              setSchedulingClient(null);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <select 
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] focus:ring-2 focus:ring-pink-500"
                  >
                    {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Type</label>
                <select 
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as 'regular' | 'emergency' })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] focus:ring-2 focus:ring-pink-500"
                >
                  <option value="regular">Regular ($150)</option>
                  <option value="emergency">Emergency ($225)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/20 transition-all active:scale-[0.98] cursor-pointer">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
