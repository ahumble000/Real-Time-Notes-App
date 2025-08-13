'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  User, 
  Save, 
  Check, 
  Bell, 
  Palette, 
  Shield, 
  Globe,
  Eye,
  Lock,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface UserProfile {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  collaborationNotifications: boolean;
  marketingEmails: boolean;
  dataCollection: boolean;
  publicProfile: boolean;
  showActivity: boolean;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: string;
  usage: {
    notesCreated: number;
    templatesCreated: number;
    workspacesCreated: number;
    collaborations: number;
  };
  subscription: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
}

type TabId = 'profile' | 'notifications' | 'appearance' | 'privacy' | 'account';

const tabs = [
  { id: 'profile' as TabId, label: 'Profile', icon: User },
  { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
  { id: 'appearance' as TabId, label: 'Appearance', icon: Palette },
  { id: 'privacy' as TabId, label: 'Privacy', icon: Shield },
  { id: 'account' as TabId, label: 'Account', icon: Lock }
];

export const UserSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Use refs to store stable references
  const userDataRef = useRef<UserData | null>(null);

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, authLoading, router]);

  // Update ref when userData changes
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/stats')
      ]);

      const combinedData: UserData = {
        id: user?.id || '',
        username: user?.username || '',
        email: user?.email || '',
        profile: profileResponse.data.profile || {
          firstName: '',
          lastName: '',
          bio: '',
          location: '',
          website: '',
          avatar: ''
        },
        preferences: profileResponse.data.preferences || {
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          emailNotifications: true,
          pushNotifications: true,
          collaborationNotifications: true,
          marketingEmails: false,
          dataCollection: true,
          publicProfile: false,
          showActivity: true
        },
        createdAt: profileResponse.data.createdAt,
        usage: statsResponse.data.usage,
        subscription: statsResponse.data.subscription
      };

      setUserData(combinedData);
    } catch (error: any) {
      toast.error('Failed to load user data');
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!userData) return;

    try {
      setSaving(true);

      const updateData = {
        profile: userData.profile,
        preferences: userData.preferences
      };

      await api.put('/users/profile', updateData);

      setSaved(true);
      toast.success('Settings saved successfully!');
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || !currentPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);

      await api.put('/users/password', {
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Direct input handlers to prevent re-renders
  const handleProfileChange = (field: keyof UserProfile) => (value: string) => {
    setUserData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      };
    });
  };

  const handlePreferenceChange = (field: keyof UserPreferences) => (value: any) => {
    setUserData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value
        }
      };
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-8">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse">
              <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                <div className="h-32 bg-gray-300 border-2 border-black mb-4"></div>
                <div className="h-4 bg-gray-200 border-2 border-black mb-2"></div>
                <div className="h-4 bg-gray-200 border-2 border-black w-3/4"></div>
              </div>
              
              <div className="lg:col-span-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                <div className="h-48 bg-gray-300 border-2 border-black"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-black mb-4 tracking-tight">
                👤 PROFILE INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={userData?.profile.firstName || ''}
                  onChange={handleProfileChange('firstName')}
                  placeholder="Enter your first name"
                />
                <InputField
                  label="Last Name"
                  value={userData?.profile.lastName || ''}
                  onChange={handleProfileChange('lastName')}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-black text-black mb-2">Bio</label>
              <textarea
                value={userData?.profile.bio || ''}
                onChange={(e) => handleProfileChange('bio')(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Location"
                value={userData?.profile.location || ''}
                onChange={handleProfileChange('location')}
                placeholder="Your location"
              />
              <InputField
                label="Website"
                value={userData?.profile.website || ''}
                onChange={handleProfileChange('website')}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="bg-blue-200 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="text-xl font-black text-black mb-3">📊 YOUR STATS</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border-3 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-2xl font-black text-black">{userData?.usage.notesCreated || 0}</div>
                  <div className="text-sm font-bold text-gray-700">Notes Created</div>
                </div>
                <div className="bg-white border-3 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-2xl font-black text-black">{userData?.usage.templatesCreated || 0}</div>
                  <div className="text-sm font-bold text-gray-700">Templates</div>
                </div>
                <div className="bg-white border-3 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-2xl font-black text-black">{userData?.usage.workspacesCreated || 0}</div>
                  <div className="text-sm font-bold text-gray-700">Workspaces</div>
                </div>
                <div className="bg-white border-3 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
                  <div className="text-2xl font-black text-black">{userData?.usage.collaborations || 0}</div>
                  <div className="text-sm font-bold text-gray-700">Collaborations</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-black mb-4 tracking-tight">
              🔔 NOTIFICATION SETTINGS
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Email Notifications',
                  description: 'Get notified about important updates',
                  color: 'bg-yellow-200'
                },
                {
                  key: 'pushNotifications',
                  label: 'Push Notifications',
                  description: 'Real-time notifications in your browser',
                  color: 'bg-pink-200'
                },
                {
                  key: 'collaborationNotifications',
                  label: 'Collaboration Updates',
                  description: 'When someone edits your shared notes',
                  color: 'bg-green-200'
                },
                {
                  key: 'marketingEmails',
                  label: 'Marketing Emails',
                  description: 'Product updates and feature announcements',
                  color: 'bg-purple-200'
                }
              ].map((setting) => (
                <div key={setting.key} className={`flex items-center justify-between p-4 ${setting.color} border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]`}>
                  <div>
                    <h4 className="text-lg font-black text-black">{setting.label}</h4>
                    <p className="text-sm font-bold text-gray-700">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange(setting.key as keyof UserPreferences)(!userData?.preferences[setting.key as keyof UserPreferences])}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full border-3 border-black transition-colors ${
                      userData?.preferences[setting.key as keyof UserPreferences] ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform ${
                        userData?.preferences[setting.key as keyof UserPreferences] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-black mb-4 tracking-tight">
              🎨 APPEARANCE SETTINGS
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-black text-black mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor }
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => handlePreferenceChange('theme')(theme.value)}
                        className={`p-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] font-black text-black transition-all duration-200 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 ${
                          userData?.preferences.theme === theme.value 
                            ? 'bg-blue-400' 
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-lg">{theme.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-lg font-black text-black mb-3">Language</label>
                <select
                  value={userData?.preferences.language || 'en'}
                  onChange={(e) => handlePreferenceChange('language')(e.target.value)}
                  className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-black text-black mb-3">Timezone</label>
                <select
                  value={userData?.preferences.timezone || ''}
                  onChange={(e) => handlePreferenceChange('timezone')(e.target.value)}
                  className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-black mb-4 tracking-tight">
              🔐 PRIVACY SETTINGS
            </h3>

            <div className="space-y-4">
              {[
                {
                  key: 'publicProfile',
                  label: 'Public Profile',
                  description: 'Make your profile visible to other users',
                  color: 'bg-red-200'
                },
                {
                  key: 'showActivity',
                  label: 'Show Activity',
                  description: 'Display your recent activity to collaborators',
                  color: 'bg-orange-200'
                },
                {
                  key: 'dataCollection',
                  label: 'Data Collection',
                  description: 'Help us improve by sharing usage analytics',
                  color: 'bg-cyan-200'
                }
              ].map((setting) => (
                <div key={setting.key} className={`flex items-center justify-between p-4 ${setting.color} border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]`}>
                  <div>
                    <h4 className="text-lg font-black text-black">{setting.label}</h4>
                    <p className="text-sm font-bold text-gray-700">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange(setting.key as keyof UserPreferences)(!userData?.preferences[setting.key as keyof UserPreferences])}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full border-3 border-black transition-colors ${
                      userData?.preferences[setting.key as keyof UserPreferences] ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform ${
                        userData?.preferences[setting.key as keyof UserPreferences] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-black mb-4 tracking-tight">
              🔒 ACCOUNT SECURITY
            </h3>

            <div className="bg-yellow-200 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="text-xl font-black text-black mb-4">Change Password</h4>
              
              <div className="space-y-4">
                <InputField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter your current password"
                />
                <InputField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter your new password"
                />
                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your new password"
                />

                <Button
                  onClick={changePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword || saving}
                  className="bg-green-400 hover:bg-green-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  {saving ? 'CHANGING...' : 'CHANGE PASSWORD'}
                </Button>
              </div>
            </div>

            <div className="bg-red-200 border-4 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
              <h4 className="text-xl font-black text-black mb-4">Account Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Username:</span>
                  <span className="font-black text-black">{userData?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Email:</span>
                  <span className="font-black text-black">{userData?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Member Since:</span>
                  <span className="font-black text-black">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Plan:</span>
                  <span className="font-black text-black uppercase">
                    {userData?.subscription.plan || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Brutal Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-black mb-2 transform hover:scale-105 transition-transform">
                ⚙️ USER SETTINGS
              </h1>
              <p className="text-lg font-bold text-gray-700">
                Manage your account and brutal preferences
              </p>
            </div>
            
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 text-lg"
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  SAVED!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brutal Sidebar */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <nav className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black text-left transform transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-400 text-black shadow-[6px_6px_0px_0px_#000] -translate-x-1 -translate-y-1'
                        : 'bg-gray-100 text-black hover:bg-gray-200 hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-lg">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Brutal Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};