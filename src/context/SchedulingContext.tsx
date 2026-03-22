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
  query
} from 'firebase/firestore';

export type Booking = {
  id: string;
  type: 'regular' | 'emergency';
  duration: 1; // Always 1 hour now
  slotId: string;
  name: string;
  email: string;
  needs: string;
  paymentMethod?: 'now' | 'later';
  status: 'Payment Pending' | 'Pending' | 'Confirmed' | 'Rejected';
  paymentStatus?: 'Completed' | 'Failed';
  paymentAmount?: number;
  paymentDate?: string;
  createdBy: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  userName: string;
  status: 'Completed' | 'Pending' | 'Failed';
};

export type Slot = {
  id: string; 
  date: string; // Used for quick filtering
  startTime: string; // ISO UTC string
  endTime: string; // ISO UTC string
  booked: boolean;
  bookedBy: string | null;
};

interface SchedulingContextType {
  slots: Slot[];
  userBookings: Booking[];
  userPayments: Payment[];
  bookConsultation: (details: Omit<Booking, 'id' | 'createdBy' | 'paymentStatus' | 'paymentAmount' | 'paymentDate'>) => Promise<string>;
  confirmPayment: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string, slotId: string) => Promise<void>;
  approveConsultation: (uid: string, bookingId: string, emailBody: string) => Promise<void>;
  rejectConsultation: (uid: string, bookingId: string, emailBody: string) => Promise<void>;
  updateConsultation: (uid: string, bookingId: string, updates: Partial<Booking>, emailBody: string) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export const SchedulingProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // 1. Listen to all slots (available in /schedule)
    const unsubSlots = onSnapshot(collection(db, 'schedule'), (querySnapshot) => {
      const dbSlots: Slot[] = [];
      querySnapshot.forEach((docSnap) => {
        dbSlots.push({ id: docSnap.id, ...docSnap.data() } as Slot);
      });
      setSlots(dbSlots);
    });

    let unsubBookings = () => {};
    let unsubPayments = () => {};

    const authUnsub = auth.onAuthStateChanged((user) => {
      if (user) {
        // Listen to User's Bookings
        const qBookings = query(collection(db, 'users', user.uid, 'bookings'));
        unsubBookings = onSnapshot(qBookings, (querySnapshot) => {
          const dbBookings: Booking[] = [];
          querySnapshot.forEach((docSnap) => {
            dbBookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
          });
          setUserBookings(dbBookings);
        });

        // Listen to User's Payments
        const qPayments = query(collection(db, 'users', user.uid, 'payments'));
        unsubPayments = onSnapshot(qPayments, (querySnapshot) => {
          const dbPayments: Payment[] = [];
          querySnapshot.forEach((docSnap) => {
            dbPayments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
          });
          setUserPayments(dbPayments);
        });
      } else {
        setUserBookings([]);
        setUserPayments([]);
        unsubBookings();
        unsubPayments();
      }
    });

    return () => {
      unsubSlots();
      authUnsub();
      unsubBookings();
      unsubPayments();
    };
  }, []);

  const bookConsultation = async (details: Omit<Booking, 'id' | 'createdBy' | 'paymentStatus' | 'paymentAmount' | 'paymentDate'>): Promise<string> => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Must be logged in to book.");

      const bookingData = {
        ...details,
        createdBy: uid
      };
      const docRef = await addDoc(collection(db, 'users', uid, 'bookings'), bookingData);
      
      try {
        await updateDoc(doc(db, 'schedule', details.slotId), { booked: true, bookedBy: uid });
      } catch (e) {
        console.warn("Permission denied when writing to schedule slot per strict rules", e);
      }
      
      return docRef.id;
    } catch (e) {
      console.error("Error booking consultation: ", e);
      return '';
    }
  };

  const confirmPayment = async (bookingId: string) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const bookingRef = doc(db, 'users', uid, 'bookings', bookingId);
      const booking = userBookings.find(b => b.id === bookingId);
      const amount = booking?.type === 'emergency' ? 225 : 150;

      await updateDoc(bookingRef, {
        status: 'Pending',
        paymentStatus: 'Completed',
        paymentAmount: amount,
        paymentDate: format(new Date(), 'yyyy-MM-dd')
      });

      // User creates payment doc in user's subcollection
      await addDoc(collection(db, 'users', uid, 'payments'), {
        bookingId,
        amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        userName: booking?.name || 'Unknown',
        status: 'Completed'
      });
    } catch (e) {
      console.error("Error confirming payment: ", e);
    }
  };

  const cancelBooking = async (bookingId: string, slotId: string) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, 'bookings', bookingId));
      try {
        await updateDoc(doc(db, 'schedule', slotId), { booked: false, bookedBy: null });
      } catch (e) {
        console.warn("Permission error on schedule cancel fallback", e);
      }
    } catch (e) {
      console.error("Error cancelling booking: ", e);
    }
  };

  const approveConsultation = async (uid: string, id: string, emailBody: string) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'bookings', id), { status: 'Confirmed' });
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error approving consultation: ", e);
    }
  };

  const rejectConsultation = async (uid: string, id: string, emailBody: string) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'bookings', id), { status: 'Rejected' });
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error rejecting consultation: ", e);
    }
  };

  const updateConsultation = async (uid: string, id: string, updates: Partial<Booking>, emailBody: string) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'bookings', id), updates);
      console.log(`[Email Sent to Client]:\n${emailBody}`);
    } catch (e) {
      console.error("Error updating consultation: ", e);
    }
  };

  return (
    <SchedulingContext.Provider value={{ 
      slots,
      userBookings,
      userPayments,
      bookConsultation,
      confirmPayment,
      cancelBooking,
      approveConsultation,
      rejectConsultation,
      updateConsultation
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
