
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SchedulingProvider } from './context/SchedulingContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SuccessPage } from './pages/SuccessPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { PaymentsDashboardPage } from './pages/admin/PaymentsDashboardPage';
import { ClientsPage } from './pages/admin/ClientsPage';
import { AvailabilityPage } from './pages/admin/AvailabilityPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <SchedulingProvider>
        <Router>
          <div className="min-h-[100svh] flex flex-col bg-gray-50 dark:bg-[#0f111a] transition-colors duration-300">
            <Navbar />
            <main className="flex-1 flex flex-col mt-20">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/payments" element={<PaymentsDashboardPage />} />
                <Route path="/admin/clients" element={<ClientsPage />} />
                <Route path="/admin/availability" element={<AvailabilityPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SchedulingProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
