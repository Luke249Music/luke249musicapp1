import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useScheduling } from '../context/SchedulingContext';
import { CreditCard, ShieldCheck } from 'lucide-react';

export const CheckoutPage = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { userBookings, confirmPayment } = useScheduling();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const consultation = userBookings.find(c => c.id === id);

  if (!consultation || consultation.status === 'Confirmed') {
    return <Navigate to="/" />;
  }

  const handlePayPalCheckout = () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      setIsSuccess(true);
      await confirmPayment(consultation.id);
      // Wait to show success message before redirecting
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    }, 2000);
  };

  const amount = consultation.type === 'emergency' ? 225 : 150;

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col items-center">
      <div className="glass-panel p-8 rounded-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-gray-500 mb-8">Secure payment powered by PayPal (Demo)</p>

        <div className="bg-gray-50 dark:bg-[#1a1d2d] rounded-2xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-600 dark:text-gray-400">{consultation.type === 'emergency' ? 'Emergency' : 'Regular'} Consultation</span>
            <span className="font-medium">${amount}.00</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
            <span className="font-medium">
              {consultation.slotId?.split('_')[0] || 'TBD'} at {consultation.slotId?.split('_')[1] || 'TBD'}
            </span>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold">
            <span>Total</span>
            <span>${amount}.00</span>
          </div>
        </div>

        <button 
          onClick={handlePayPalCheckout}
          disabled={isProcessing || isSuccess}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mb-4 
            ${isSuccess 
              ? 'bg-green-500 text-white cursor-default scale-105' 
              : 'bg-[#0070ba] hover:bg-[#003087] text-white cursor-pointer'}`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSuccess ? (
             <>
               <ShieldCheck className="w-6 h-6" />
               Payment Successful!
             </>
          ) : (
             <>
               <CreditCard className="w-6 h-6" />
               Pay with simulated PayPal
             </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Simulated secure checkout</span>
        </div>
      </div>
    </div>
  );
};
