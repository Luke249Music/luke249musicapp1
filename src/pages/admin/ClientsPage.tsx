import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { Mail, ShieldBan, ShieldCheck, Database, X, Check } from 'lucide-react';

export const ClientsPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const [viewedClient, setViewedClient] = useState<any | null>(null);
  const [viewedData, setViewedData] = useState<{ bookings: any[], payments: any[] }>({ bookings: [], payments: [] });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const cls: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.role !== 'admin') {
          cls.push({ id: docSnap.id, ...data });
        }
      });
      setClients(cls);
    });
    return () => unsub();
  }, []);

  const toggleClientStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
    try {
      await updateDoc(doc(db, 'users', id), { status: newStatus });
    } catch (e) {
      console.error("Error toggling status", e);
    }
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { name: editForm.name, email: editForm.email });
      setEditingId(null);
    } catch (e) {
      console.error("Error updating user", e);
    }
  };

  const loadClientData = async (client: any) => {
    setViewedClient(client);
    try {
      const bSnap = await getDocs(collection(db, 'users', client.id, 'bookings'));
      const pSnap = await getDocs(collection(db, 'users', client.id, 'payments'));
      
      setViewedData({
        bookings: bSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        payments: pSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    } catch (e) {
      console.error("Error loading subcollections", e);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Directory</h1>
          <p className="text-gray-500">Manage all registered users on your platform</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Client Info</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
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
                          {(client.name || 'U').charAt(0)}
                        </div>
                        {isEditing ? (
                          <input 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-1.5 text-sm rounded-lg border border-pink-300 dark:border-pink-700 bg-white dark:bg-[#0f111a] focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        ) : (
                          <span className="font-medium">{client.name || 'Unknown'}</span>
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
                          {client.email || 'No email'}
                        </a>
                      )}
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
                              onClick={() => loadClientData(client)}
                              title="View Data Subcollections"
                              className="p-1.5 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                            >
                              <Database className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleClientStatus(client.id, client.status)}
                              title={client.status === 'revoked' ? "Restore Access" : "Revoke Access"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                client.status === 'revoked' 
                                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30' 
                                  : 'text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30'
                              }`}>
                              {client.status === 'revoked' ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No clients registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-2xl bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Data for {viewedClient.name}</h2>
              <button 
                onClick={() => setViewedClient(null)} 
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">Bookings ({viewedData.bookings.length})</h3>
                <div className="bg-gray-50 dark:bg-[#0f111a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {viewedData.bookings.length === 0 ? <p className="text-sm text-gray-500">No bookings found.</p> : (
                    <ul className="space-y-2">
                       {viewedData.bookings.map(b => (
                         <li key={b.id} className="text-sm flex justify-between">
                           <span>{b.slotId} - {b.status}</span>
                           <span className="font-mono text-xs text-gray-400">{b.id}</span>
                         </li>
                       ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">Payments ({viewedData.payments.length})</h3>
                <div className="bg-gray-50 dark:bg-[#0f111a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {viewedData.payments.length === 0 ? <p className="text-sm text-gray-500">No payments found.</p> : (
                    <ul className="space-y-2">
                       {viewedData.payments.map(p => (
                         <li key={p.id} className="text-sm flex justify-between">
                           <span>${p.amount} - {p.date} - {p.status}</span>
                           <span className="font-mono text-xs text-gray-400">{p.id}</span>
                         </li>
                       ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
