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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to access your collaborative notes
          </p>
        </div>

        {/* Login Form */}
        <Card variant="shadow" padding="xl" className="backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create a new account</span>
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
