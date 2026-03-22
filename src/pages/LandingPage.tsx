import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduling } from '../context/SchedulingContext';
import { useAuth } from '../context/AuthContext';
import { CalendarPicker } from '../components/CalendarPicker';
import { Clock, User, Mail, MessageSquare } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

type Step = 'duration' | 'datetime' | 'details';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookConsultation } = useScheduling();
  
  const [step, setStep] = useState<Step>('duration');
  const [sessionType, setSessionType] = useState<'regular' | 'emergency' | null>(null);
  const [datetime, setDatetime] = useState<{date: string, time: string} | null>(null);
  
  // Form details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [needs, setNeeds] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'now' | 'later'>('now');

  const handleTypeSelect = (type: 'regular' | 'emergency') => {
    setSessionType(type);
    setStep('datetime');
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setDatetime({ date, time });
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionType || !datetime) return;
    
    if (!user) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Failed to sign in anonymously:', err);
      }
    }

    // Create consultation via context
    const id = bookConsultation({
      type: sessionType,
      duration: 1,
      date: datetime.date,
      time: datetime.time,
      name,
      email,
      needs,
      paymentMethod,
      status: paymentMethod === 'now' ? 'Payment Pending' : 'Pending'
    });
    
    if (paymentMethod === 'now') {
      navigate(`/checkout?id=${id}`);
    } else {
      navigate('/success');
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-2xl px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
          Let's create something <span className="text-hot-pink-gradient">extraordinary.</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Book a 1-on-1 consultation and let's discuss how we can bring your vision to life. Select an option below to get started.
        </p>
      </div>

      {/* Main Flow Container */}
      <div className="w-full relative min-h-[400px]">
        {/* Step 1: Session Type */}
        {step === 'duration' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button
               onClick={() => handleTypeSelect('regular')}
              className="glass-panel p-8 rounded-3xl text-left hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-pink-400"
            >
              <div className="bg-pink-100 dark:bg-pink-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-hot-pink-gradient transition-colors">
                <Clock className="w-8 h-8 text-pink-500 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Regular Consultation</h3>
              <p className="text-gray-500 dark:text-gray-400">Perfect for quick brainstorms, code reviews, and problem solving. Requires 48 hours notice.</p>
              <div className="mt-8 text-xl font-bold text-gray-900 dark:text-white">$150</div>
            </button>
            
            <button
               onClick={() => handleTypeSelect('emergency')}
              className="glass-panel p-8 rounded-3xl text-left hover:scale-[1.02] transition-transform group cursor-pointer border-t-4 border-t-red-400"
            >
              <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                <Clock className="w-8 h-8 text-red-500 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Emergency Consultation</h3>
              <p className="text-gray-500 dark:text-gray-400">Immediate priority booking for critical issues. Available within the next 48 hours.</p>
              <div className="mt-8 text-xl font-bold text-gray-900 dark:text-white">$225</div>
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center w-full">
            <button onClick={() => setStep('duration')} className="mb-6 text-sm text-pink-500 hover:text-pink-600 font-medium">
              ← Back to session type
            </button>
            <CalendarPicker 
              onSelect={handleDateTimeSelect} 
              minDate={sessionType === 'regular' ? new Date(new Date().setHours(0,0,0,0) + 2 * 24 * 60 * 60 * 1000) : undefined}
            />
          </div>
        )}

        {/* Step 3: Details Input */}
        {step === 'details' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto w-full">
            <button onClick={() => setStep('datetime')} className="mb-6 text-sm text-pink-500 hover:text-pink-600 font-medium">
              ← Back to calendar
            </button>
            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Almost there!</h2>
              <p className="text-gray-500 text-sm">You selected an <strong>{sessionType === 'emergency' ? 'Emergency' : 'Regular'} Consultation</strong> on {datetime?.date} at {datetime?.time}.</p>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow" placeholder="Jane Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow" placeholder="jane@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">What would you like to discuss?</label>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                  <textarea required value={needs} onChange={e => setNeeds(e.target.value)} rows={4} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-shadow resize-none" placeholder="I need help architecting my new software project..." />
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Payment Preference</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border rounded-xl p-4 cursor-pointer flex flex-col gap-1 transition-all ${paymentMethod === 'now' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={paymentMethod === 'now'} onChange={() => setPaymentMethod('now')} className="accent-pink-500" />
                      <span className="font-bold">Pay Now</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-6">Secure via PayPal</span>
                  </label>
                  <label className={`border rounded-xl p-4 cursor-pointer flex flex-col gap-1 transition-all ${paymentMethod === 'later' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="payment" checked={paymentMethod === 'later'} onChange={() => setPaymentMethod('later')} className="accent-pink-500" />
                      <span className="font-bold">Pay Later</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-6">In person at arrival</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-hot-pink-gradient text-white py-4 mt-2 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg shadow-pink-500/20 transition-all">
                {paymentMethod === 'now' ? 'Proceed to Payment' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
