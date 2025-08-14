'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {InputField} from '@/components/ui/InputField';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import { User, Mail, Lock, UserPlus, LogIn, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Welcome! Account created successfully!');
      router.push('/notes');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[8px_8px_0px_0px_#000] transform rotate-2">
              <UserPlus className="w-10 h-10 text-black font-bold" />
            </div>
            <h2 className="text-4xl font-black text-black tracking-tight">
              Join Us Today
            </h2>
            <p className="text-lg font-bold text-gray-700">
              Create your account and start collaborating with style
            </p>
          </div>          {/* Registration Form */}
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform -rotate-1 relative">
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 border-2 border-black rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-300 border-2 border-black rounded-full"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <InputField
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Choose a username"
                icon={<User className="w-5 h-5" />}
                helperText="This will be your display name"
                required
                disabled={loading}
              />

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
                placeholder="Create a secure password"
                icon={<Lock className="w-5 h-5" />}
                helperText="Must be at least 6 characters long"
                required
                disabled={loading}
              />

              <InputField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm your password"
                icon={<Shield className="w-5 h-5" />}
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
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
                  icon={<UserPlus className="w-5 h-5" />}
                >
                  Create Account
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/login" 
                    className="inline-flex items-center space-x-2 px-4 py-2 border-3 border-black rounded-xl bg-purple-200 hover:bg-purple-100 font-black text-black transition-all duration-200 shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Already have an account? Sign in</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Terms Notice */}
          <div className="bg-blue-200 border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000] text-center transform rotate-1">
            <p className="text-sm font-bold text-black">
              By creating an account, you agree to our{' '}
              <span className="font-black text-purple-600 underline decoration-2 decoration-purple-600">Terms of Service</span> and{' '}
              <span className="font-black text-purple-600 underline decoration-2 decoration-purple-600">Privacy Policy</span>
            </p>
          </div>
      </div>
    </div>
  );
}
