import { useScheduling } from '../../context/SchedulingContext';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Activity, Users as UsersIcon } from 'lucide-react';

export const PaymentsDashboardPage = () => {
  const { payments, consultations } = useScheduling();
  const { clients } = useAuth();
  
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const activeClients = clients.length;
  const totalSessions = consultations.length;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments Analytics</h1>
        <p className="text-gray-500">Track your revenues and booking metrics</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">${totalRevenue}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Platform Sessions</p>
              <h3 className="text-3xl font-bold mt-2">{totalSessions}</h3>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Clients</p>
              <h3 className="text-3xl font-bold mt-2">{activeClients}</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-6">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-right">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">{payment.date}</td>
                  <td className="py-4 px-4 font-medium">{payment.userName}</td>
                  <td className="py-4 px-4">${payment.amount}.00</td>
                  <td className="py-4 px-4">
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xs text-gray-400">#{payment.id.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
