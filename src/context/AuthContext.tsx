import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Role = 'user' | 'admin';

export type User = {
  name: string;
  email: string;
  role: Role;
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
  clients: Client[];
  login: (name: string, email: string) => void;
  logout: () => void;
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
  const [clients, setClients] = useState<Client[]>(mockClients);

  const login = (name: string, email: string) => {
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (client && client.status === 'revoked') {
      alert('Your access has been revoked. Please contact support.');
      return;
    }
    const role = email.toLowerCase() === 'spenser12@gmail.com' ? 'admin' : 'user';
    setUser({ name, email, role });
  };

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, clients, login, logout, addClient, updateClient, deleteClient, toggleClientStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
