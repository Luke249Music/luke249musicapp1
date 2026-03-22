import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

export const VerifyEmailPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-hot-pink-gradient p-4 rounded-full text-white shadow-lg">
            <MailCheck className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          We've sent a verification link to your email address. 
          Please check your inbox (and spam folder) and click the link to activate your account.
        </p>

        <Link
          to="/login"
          className="inline-block w-full bg-hot-pink-gradient text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shadow-pink-500/20"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};
