'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  Settings,
  UserPlus,
  Crown,
  Shield,
  Clock,
  X,
  ExternalLink,
  Globe,
  Lock,
  Trash2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Header } from '../layout/Header';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WorkspaceMember {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  members: WorkspaceMember[];
  settings: {
    isPublic: boolean;
    allowGuestAccess: boolean;
    theme: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceSettingsProps {
  workspaceId: string;
}

export const WorkspaceSettings = ({ workspaceId }: WorkspaceSettingsProps) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sending, setSending] = useState(false);

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && workspaceId) {
      fetchWorkspace();
    }
  }, [isAuthenticated, authLoading, workspaceId, router]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workspaces/${workspaceId}`);
      setWorkspace(response.data.workspace);
    } catch (error: any) {
      console.error('Error fetching workspace:', error);
      toast.error(error.response?.data?.error || 'Failed to load workspace');
      router.push('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    try {
      const response = await api.put(`/workspaces/${workspaceId}`, updates);
      setWorkspace(response.data);
      toast.success('Workspace updated successfully!');
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      toast.error(error.response?.data?.error || 'Failed to update workspace');
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setSending(true);
      await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail,
        role: inviteRole
      });

      toast.success('Member invited successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('viewer');
      fetchWorkspace(); // Refresh workspace data
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.response?.data?.error || 'Failed to invite member');
    } finally {
      setSending(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      toast.success('Member removed successfully!');
      fetchWorkspace();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const deleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted successfully!');
      router.push('/workspaces');
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      toast.error(error.response?.data?.error || 'Failed to delete workspace');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-400 border-blue-600 text-blue-900';
      case 'editor':
        return 'bg-green-400 border-green-600 text-green-900';
      default:
        return 'bg-gray-400 border-gray-600 text-gray-900';
    }
  };

  const isOwner = workspace?.owner._id === user?.id;

  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
        <h3 className="text-2xl font-black text-black mb-4">🏢 WORKSPACE INFO</h3>
        
        <div className="space-y-4">
          <InputField
            label="Workspace Name"
            value={workspace?.name || ''}
            onChange={(value) => updateWorkspace({ name: value })}
            placeholder="Enter workspace name"
          />

          <div>
            <label className="block text-lg font-black text-black mb-2">Description</label>
            <textarea
              value={workspace?.description || ''}
              onChange={(e) => updateWorkspace({ description: e.target.value })}
              placeholder="Describe your workspace..."
              rows={3}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
        <h3 className="text-2xl font-black text-black mb-4">⚙️ SETTINGS</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-100 border-3 border-black rounded-xl p-4">
            <div>
              <h4 className="font-black text-black">Public Workspace</h4>
              <p className="text-sm font-bold text-gray-700">Anyone can find and view this workspace</p>
            </div>
            <button
              onClick={() => updateWorkspace({
                settings: {
                  isPublic: !workspace?.settings?.isPublic,
                  allowGuestAccess: workspace?.settings?.allowGuestAccess || false,
                  theme: workspace?.settings?.theme || 'default'
                }
              })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full border-3 border-black transition-colors ${
                workspace?.settings?.isPublic ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform ${
                  workspace?.settings?.isPublic ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between bg-yellow-100 border-3 border-black rounded-xl p-4">
            <div>
              <h4 className="font-black text-black">Guest Access</h4>
              <p className="text-sm font-bold text-gray-700">Allow guests to access without joining</p>
            </div>
            <button
              onClick={() => updateWorkspace({
                settings: {
                  isPublic: workspace?.settings?.isPublic || false,
                  allowGuestAccess: !workspace?.settings?.allowGuestAccess,
                  theme: workspace?.settings?.theme || 'default'
                }
              })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full border-3 border-black transition-colors ${
                workspace?.settings?.allowGuestAccess ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform ${
                  workspace?.settings?.allowGuestAccess ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="bg-red-100 border-4 border-red-600 rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
          <h3 className="text-2xl font-black text-red-600 mb-4">⚠️ DANGER ZONE</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-red-900">Delete Workspace</h4>
              <p className="text-sm font-bold text-red-700">This action cannot be undone</p>
            </div>
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-400 text-white font-black px-4 py-2 border-4 border-red-700 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              DELETE WORKSPACE
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-black">
          👥 MEMBERS ({workspace?.members?.length || 0})
        </h3>
        {(isOwner || workspace?.members?.find(m => m.user._id === user?.id)?.role === 'admin') && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-green-400 hover:bg-green-300 text-black font-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            INVITE MEMBER
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Owner */}
        <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-3 border-black">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-black text-black">{workspace?.owner.username}</h4>
                  <span className="bg-yellow-400 border-2 border-black px-2 py-1 text-xs rounded-lg font-black text-black">
                    OWNER
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600">{workspace?.owner.email}</p>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {workspace ? new Date(workspace.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Members */}
        {workspace?.members?.map((member) => (
          <Card key={member._id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-3 border-black">
                  <span className="text-white font-black text-lg">
                    {member.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-black">{member.user.username}</h4>
                    <span className={`border-2 px-2 py-1 text-xs rounded-lg font-black ${getRoleBadgeColor(member.role)}`}>
                      {member.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-600">{member.user.email}</p>
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {(isOwner || (workspace?.members?.find(m => m.user._id === user?.id)?.role === 'admin' && member.role !== 'admin')) && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => removeMember(member.user._id)}
                    className="bg-red-400 hover:bg-red-300 text-black font-black p-2 border-3 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'members':
        return <MembersTab />;
      default:
        return <GeneralTab />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse">
            <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6 text-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-12 transform -rotate-1">
            <h2 className="text-3xl font-black text-black mb-4">WORKSPACE NOT FOUND</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              The workspace you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button
              onClick={() => router.push('/workspaces')}
              className="bg-blue-400 hover:bg-blue-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              BACK TO WORKSPACES
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <h1 className="text-4xl font-black text-black mb-2">
            ⚙️ {workspace.name} SETTINGS
          </h1>
          <p className="text-lg font-bold text-gray-700">
            Manage your workspace settings and members
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
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
                      <Icon className="w-5 h-5" />
                      <span className="text-lg">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="🚀 INVITE MEMBER"
        >
          <div className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={setInviteEmail}
              placeholder="Enter email address"
            />

            <div>
              <label className="block text-lg font-black text-black mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-200 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                CANCEL
              </Button>
              <Button
                onClick={inviteMember}
                disabled={sending || !inviteEmail.trim()}
                className="flex-1 bg-green-400 hover:bg-green-300 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                {sending ? 'INVITING...' : 'SEND INVITE'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="⚠️ DELETE WORKSPACE"
        >
          <div className="space-y-6">
            <div className="bg-red-100 border-3 border-red-600 rounded-xl p-4">
              <p className="font-bold text-red-900">
                Are you sure you want to delete this workspace? This action cannot be undone.
              </p>
              <p className="text-sm font-bold text-red-700 mt-2">
                All notes in this workspace will be moved to your personal space.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-200 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                CANCEL
              </Button>
              <Button
                onClick={deleteWorkspace}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-3 border-4 border-red-700 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                DELETE WORKSPACE
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
