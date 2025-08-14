'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {InputField} from '@/components/ui/InputField';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! Login successful!');
      router.push('/notes');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[8px_8px_0px_0px_#000] transform rotate-2">
            <LogIn className="w-10 h-10 text-black font-bold" />
          </div>
          <h2 className="text-4xl font-black text-black tracking-tight">
            Welcome Back
          </h2>
          <p className="text-lg font-bold text-gray-700">
            Sign in to access your notes
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform -rotate-1">
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 border-2 border-black rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 border-2 border-black rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email address"
              icon={<Mail className="w-5 h-5" />}
              required
              disabled={loading}
            />
            
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              required
              disabled={loading}
            />

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                icon={<LogIn className="w-5 h-5" />}
              >
                Sign In
              </Button>

              <div className="text-center">
                <Link 
                  href="/auth/register" 
                  className="inline-flex items-center space-x-2 px-4 py-2 border-3 border-black rounded-xl bg-purple-200 hover:bg-purple-100 font-black text-black transition-all duration-200 shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create a new account</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
