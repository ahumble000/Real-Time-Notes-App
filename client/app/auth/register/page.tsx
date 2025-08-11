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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Join Us Today
          </h2>
          <p className="text-gray-600">
            Create your account and start collaborating
          </p>
        </div>

        {/* Registration Form */}
        <Card variant="shadow" padding="xl" className="backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Already have an account? Sign in</span>
                </Link>
              </div>
            </div>
          </form>
        </Card>

        {/* Terms Notice */}
        <Card variant="bordered" padding="md" className="text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <span className="font-medium text-blue-600">Terms of Service</span> and{' '}
            <span className="font-medium text-blue-600">Privacy Policy</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
