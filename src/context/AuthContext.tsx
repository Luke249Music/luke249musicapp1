import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';

export type Role = 'user' | 'admin';

export type User = {
  uid: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  isAnonymous: boolean;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  totalSessions: number;
  status?: 'active' | 'revoked';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  clients: Client[];
  logout: () => Promise<void>;
  addClient: (name: string, email: string) => void;
  updateClient: (id: string, name: string, email: string) => void;
  deleteClient: (id: string) => void;
  toggleClientStatus: (id: string) => void;
}

const mockClients: Client[] = [
  { id: 'c1', name: 'Alex Rivera', email: 'arivera@example.com', joinedDate: '2023-08-14', totalSessions: 4 },
  { id: 'c2', name: 'Jordan Lee', email: 'jlee@example.com', joinedDate: '2023-10-02', totalSessions: 1 },
  { id: 'c3', name: 'Taylor Swift', email: 'taylor@example.com', joinedDate: '2023-11-15', totalSessions: 2 },
  { id: 'c4', name: 'Morgan Chen', email: 'morgan@example.com', joinedDate: '2024-01-20', totalSessions: 0 },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>(mockClients);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Mock admin check
        const role = firebaseUser.email?.toLowerCase() === 'spenser12@gmail.com' ? 'admin' : 'user';
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          email: firebaseUser.email || '',
          role,
          emailVerified: firebaseUser.emailVerified,
          isAnonymous: firebaseUser.isAnonymous
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addClient = (name: string, email: string) => {
    const newClient: Client = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      joinedDate: new Date().toISOString().split('T')[0],
      totalSessions: 0,
      status: 'active'
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, name: string, email: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, name, email } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const toggleClientStatus = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'revoked' ? 'active' : 'revoked' } : c));
  };

  return (
    <AuthContext.Provider value={{ user, loading, clients, logout, addClient, updateClient, deleteClient, toggleClientStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
