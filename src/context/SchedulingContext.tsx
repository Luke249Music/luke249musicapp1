import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query
} from 'firebase/firestore';

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
  // New fields to fit 'payments' inside bookings per the new Firestore security rules
  paymentStatus?: 'Completed' | 'Failed';
  paymentAmount?: number;
  paymentDate?: string;
  createdBy?: string;
};

export type Payment = {
  id: string;
  consultationId: string;
  amount: number;
  date: string;
  userName: string;
  status: 'Completed' | 'Pending' | 'Failed';
};

interface SchedulingContextType {
  consultations: Consultation[];
  payments: Payment[];
  blockedDates: string[];
  bookConsultation: (consultation: Omit<Consultation, 'id'>) => Promise<string>;
  confirmPayment: (id: string) => Promise<void>;
  approveConsultation: (id: string, emailBody: string) => Promise<void>;
  rejectConsultation: (id: string, emailBody: string) => Promise<void>;
  updateConsultation: (id: string, updates: Partial<Consultation>, emailBody: string) => Promise<void>;
  cancelConsultation: (id: string) => Promise<void>;
  rescheduleConsultation: (id: string, newDate: string, newTime: string) => Promise<void>;
  toggleBlockedDate: (date: string) => Promise<void>;
  toggleDayOfWeek: (dayIndex: number, year: number) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export const SchedulingProvider = ({ children }: { children: ReactNode }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    // Listen to "bookings" collection per the new security rules
    const qBookings = query(collection(db, 'bookings'));
    const unsubConsultations = onSnapshot(qBookings, (querySnapshot) => {
      const dbConsultations: Consultation[] = [];
      const computedPayments: Payment[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<Consultation, 'id'>;
        const consult = { id: docSnap.id, ...data } as Consultation;
        dbConsultations.push(consult);

        // If payment was completed, assemble it for the UI's payments array dynamically!
        if (data.paymentStatus === 'Completed' && data.paymentAmount) {
          computedPayments.push({
            id: `pay_${docSnap.id}`,
            consultationId: docSnap.id,
            amount: data.paymentAmount,
            date: data.paymentDate || format(new Date(), 'yyyy-MM-dd'),
            userName: data.name,
            status: 'Completed'
          });
        }
      });
      setConsultations(dbConsultations);
      setPayments(computedPayments);
    });
    
    // Listen to "schedule/blockedDates" per the new security rules
    const unsubBlocked = onSnapshot(doc(db, 'schedule', 'blockedDates'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().dates) {
        setBlockedDates(docSnap.data().dates);
      } else {
        setBlockedDates([]);
      }
    });

    return () => {
      unsubConsultations();
      unsubBlocked();
    };
  }, []);

  const bookConsultation = async (details: Omit<Consultation, 'id' | 'createdBy'>): Promise<string> => {
    try {
      // Must set createdBy to match User UID per the new Security Rules (for updates later)
      const bookingData = {
        ...details,
        createdBy: auth.currentUser?.uid || 'anonymous'
      };
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log(`[Admin Notification Email]: New ${details.type} booking received from ${details.name} (${details.email}).`);
      return docRef.id;
    } catch (e) {
      console.error("Error booking consultation: ", e);
      return '';
    }
  };

  const confirmPayment = async (id: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      const consultation = consultations.find(c => c.id === id);
      const amount = consultation?.type === 'emergency' ? 225 : 150;

      await updateDoc(consultationRef, {
        status: 'Pending',
        paymentStatus: 'Completed',
        paymentAmount: amount,
        paymentDate: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (e) {
      console.error("Error confirming payment: ", e);
    }
  };

  const approveConsultation = async (id: string, emailBody: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      await updateDoc(consultationRef, { status: 'Confirmed' });
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error approving consultation: ", e);
    }
  };

  const rejectConsultation = async (id: string, emailBody: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      await updateDoc(consultationRef, { status: 'Rejected' });
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error rejecting consultation: ", e);
    }
  };

  const updateConsultation = async (id: string, updates: Partial<Consultation>, emailBody: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      await updateDoc(consultationRef, updates);
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error updating consultation: ", e);
    }
  };

  const cancelConsultation = async (id: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      await deleteDoc(consultationRef);
    } catch (e) {
      console.error("Error cancelling consultation: ", e);
    }
  };

  const rescheduleConsultation = async (id: string, newDate: string, newTime: string) => {
    try {
      const consultationRef = doc(db, 'bookings', id);
      await updateDoc(consultationRef, { date: newDate, time: newTime });
    } catch (e) {
      console.error("Error rescheduling consultation: ", e);
    }
  };

  const toggleBlockedDate = async (date: string) => {
    const updatedDates = blockedDates.includes(date) 
      ? blockedDates.filter(d => d !== date) 
      : [...blockedDates, date];
    
    // Save to Firestore
    try {
      await updateDoc(doc(db, 'schedule', 'blockedDates'), { dates: updatedDates });
    } catch (e: any) {
       if (e.code === 'not-found') {
          await setDoc(doc(db, 'schedule', 'blockedDates'), { dates: updatedDates });
       } else {
          console.error("Firestore block error: ", e);
       }
    }
  };

  const toggleDayOfWeek = async (dayIndex: number, year: number) => {
    const datesToToggle: string[] = [];
    let d = new Date(year, 0, 1);
    while (d.getDay() !== dayIndex) {
      d.setDate(d.getDate() + 1);
    }
    while (d.getFullYear() === year) {
      datesToToggle.push(format(d, 'yyyy-MM-dd'));
      d.setDate(d.getDate() + 7);
    }
    
    let updatedDates = [...blockedDates];
    const allBlocked = datesToToggle.every(date => blockedDates.includes(date));
    
    if (allBlocked) {
      updatedDates = updatedDates.filter(date => !datesToToggle.includes(date));
    } else {
      const set = new Set([...updatedDates, ...datesToToggle]);
      updatedDates = Array.from(set);
    }

    try {
      await updateDoc(doc(db, 'schedule', 'blockedDates'), { dates: updatedDates });
    } catch (e: any) {
      if (e.code === 'not-found') {
        await setDoc(doc(db, 'schedule', 'blockedDates'), { dates: updatedDates });
      } else {
        console.error("Firestore block error: ", e);
      }
    }
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
