import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { addDays, subDays, format } from 'date-fns';

export type Consultation = {
  id: string;
  type: 'regular' | 'emergency';
  duration: 1; // Always 1 hour now
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  name: string;
  email: string;
  needs: string;
  paymentMethod?: 'now' | 'later';
  status: 'Payment Pending' | 'Pending' | 'Confirmed' | 'Rejected';
};

export type Payment = {
  id: string;
  consultationId: string;
  amount: number;
  date: string;
  userName: string;
  status: 'Completed' | 'Pending' | 'Failed';
};

const today = new Date();
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);
const lastWeek = subDays(today, 7);

const generateMockConsultations = (): Consultation[] => [
  {
    id: 's1',
    type: 'regular',
    duration: 1,
    date: format(lastWeek, 'yyyy-MM-dd'),
    time: '10:00 AM',
    name: 'Alex Rivera',
    email: 'arivera@example.com',
    needs: 'Code review for React project',
    paymentMethod: 'now',
    status: 'Confirmed'
  },
  {
    id: 's2',
    type: 'emergency',
    duration: 1,
    date: format(tomorrow, 'yyyy-MM-dd'),
    time: '2:00 PM',
    name: 'Jordan Lee',
    email: 'jlee@example.com',
    needs: 'System Architecture Design',
    paymentMethod: 'later',
    status: 'Confirmed'
  },
  {
    id: 's3',
    type: 'regular',
    duration: 1,
    date: format(nextWeek, 'yyyy-MM-dd'),
    time: '11:00 AM',
    name: 'Taylor Swift',
    email: 'taylor@example.com',
    needs: 'Portfolio Website Feedback',
    paymentMethod: 'now',
    status: 'Pending'
  }
];

const generateMockPayments = (): Payment[] => [
  { id: 'p1', consultationId: 's1', amount: 150, date: format(subDays(today, 10), 'yyyy-MM-dd'), userName: 'Alex Rivera', status: 'Completed' },
  { id: 'p2', consultationId: 's2', amount: 275, date: format(subDays(today, 2), 'yyyy-MM-dd'), userName: 'Jordan Lee', status: 'Completed' },
  { id: 'p3', consultationId: 's3', amount: 150, date: format(today, 'yyyy-MM-dd'), userName: 'Taylor Swift', status: 'Completed' },
  { id: 'p4', consultationId: 's4', amount: 275, date: format(subDays(today, 15), 'yyyy-MM-dd'), userName: 'Anonymous Client', status: 'Completed' },
  { id: 'p5', consultationId: 's5', amount: 150, date: format(subDays(today, 20), 'yyyy-MM-dd'), userName: 'Anonymous Client', status: 'Completed' }
];

interface SchedulingContextType {
  consultations: Consultation[];
  payments: Payment[];
  blockedDates: string[];
  bookConsultation: (consultation: Omit<Consultation, 'id'>) => string;
  confirmPayment: (id: string) => void;
  approveConsultation: (id: string, emailBody: string) => void;
  rejectConsultation: (id: string, emailBody: string) => void;
  updateConsultation: (id: string, updates: Partial<Consultation>, emailBody: string) => void;
  cancelConsultation: (id: string) => void;
  rescheduleConsultation: (id: string, newDate: string, newTime: string) => void;
  toggleBlockedDate: (date: string) => void;
  toggleDayOfWeek: (dayIndex: number, year: number) => void;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export const SchedulingProvider = ({ children }: { children: ReactNode }) => {
  const [consultations, setConsultations] = useState<Consultation[]>(generateMockConsultations());
  const [payments, setPayments] = useState<Payment[]>(generateMockPayments());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const bookConsultation = (details: Omit<Consultation, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newConsultation = { ...details, id };
    setConsultations(prev => [...prev, newConsultation]);
    
    // Simulate email to Admin
    console.log(`[Admin Notification Email]: New ${details.type} booking received from ${details.name} (${details.email}) on ${details.date} at ${details.time}.`);
    
    return id;
  };

  const confirmPayment = (id: string) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'Pending' } : c));
    const consultation = consultations.find(c => c.id === id);
    if (consultation) {
      const newPayment: Payment = {
        id: Math.random().toString(36).substring(2, 9),
        consultationId: id,
        amount: consultation.type === 'emergency' ? 225 : 150,
        date: format(new Date(), 'yyyy-MM-dd'),
        userName: consultation.name,
        status: 'Completed'
      };
      setPayments(prev => [newPayment, ...prev]);
    }
  };

  const approveConsultation = (id: string, emailBody: string) => {
    console.log(`[Email Sent to Client]:\n${emailBody}`);
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'Confirmed' } : c));
  };

  const rejectConsultation = (id: string, emailBody: string) => {
    console.log(`[Email Sent to Client]:\n${emailBody}`);
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  };

  const updateConsultation = (id: string, updates: Partial<Consultation>, emailBody: string) => {
    console.log(`[Email Sent to Client]:\n${emailBody}`);
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const cancelConsultation = (id: string) => {
    setConsultations(prev => prev.filter(c => c.id !== id));
  };

  const rescheduleConsultation = (id: string, newDate: string, newTime: string) => {
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, date: newDate, time: newTime } : c));
  };

  const toggleBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const toggleDayOfWeek = (dayIndex: number, year: number) => {
    const datesToToggle: string[] = [];
    let d = new Date(year, 0, 1);
    while (d.getDay() !== dayIndex) {
      d.setDate(d.getDate() + 1);
    }
    while (d.getFullYear() === year) {
      datesToToggle.push(format(d, 'yyyy-MM-dd'));
      d.setDate(d.getDate() + 7);
    }
    
    setBlockedDates(prev => {
      const allBlocked = datesToToggle.every(date => prev.includes(date));
      if (allBlocked) {
        return prev.filter(date => !datesToToggle.includes(date));
      } else {
        const set = new Set([...prev, ...datesToToggle]);
        return Array.from(set);
      }
    });
  };

  return (
    <SchedulingContext.Provider value={{ 
      consultations, 
      payments, 
      blockedDates, 
      bookConsultation, 
      confirmPayment,
      approveConsultation,
      rejectConsultation,
      updateConsultation,
      cancelConsultation,
      rescheduleConsultation,
      toggleBlockedDate,
      toggleDayOfWeek
    }}>
      {children}
    </SchedulingContext.Provider>
  );
};

export const useScheduling = () => {
  const context = useContext(SchedulingContext);
  if (!context) throw new Error('useScheduling must be used within SchedulingProvider');
  return context;
};
