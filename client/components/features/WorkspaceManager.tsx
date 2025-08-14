'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Settings, 
  MoreVertical,
  FolderOpen,
  Lock,
  Globe,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Header } from '../layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    joinedAt: string;
  }>;
  settings: {
    isPublic: boolean;
    allowGuestAccess: boolean;
    theme: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const WorkspaceManager = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workspaces');
      setWorkspaces(response.data);
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWorkspaceClick = (workspace: Workspace) => {
    router.push(`/workspaces/${workspace._id}`);
  };

  const handleEditWorkspace = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/settings`);
  };

  const handleViewWorkspace = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/notes`);
  };

  const CreateWorkspaceModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      isPublic: false,
      allowGuestAccess: false
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;

      try {
        setCreating(true);
        const response = await api.post('/workspaces', formData);
        
        setWorkspaces(prev => [response.data, ...prev]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', isPublic: false, allowGuestAccess: false });
        toast.success('Workspace created successfully!');
      } catch (error: any) {
        console.error('Error creating workspace:', error);
        toast.error(error.response?.data?.error || 'Failed to create workspace');
      } finally {
        setCreating(false);
      }
    };

    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="🚀 CREATE YOUR WORKSPACE"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Workspace Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter your workspace name"
            required
          />

          <div>
            <label className="block text-lg font-black text-black mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your workspace..."
              rows={3}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-blue-100 border-3 border-black rounded-xl p-4">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-5 h-5 border-3 border-black rounded"
              />
              <label htmlFor="isPublic" className="font-black text-black">
                🌍 MAKE THIS WORKSPACE PUBLIC
              </label>
            </div>

            <div className="flex items-center gap-3 bg-yellow-100 border-3 border-black rounded-xl p-4">
              <input
                type="checkbox"
                id="allowGuestAccess"
                checked={formData.allowGuestAccess}
                onChange={(e) => setFormData({ ...formData, allowGuestAccess: e.target.checked })}
                className="w-5 h-5 border-3 border-black rounded"
              />
              <label htmlFor="allowGuestAccess" className="font-black text-black">
                👥 ALLOW GUEST ACCESS
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-200 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="flex-1 bg-green-400 hover:bg-green-300 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              {creating ? 'CREATING...' : 'CREATE WORKSPACE'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 animate-pulse mb-8">
            <div className="h-12 bg-gray-300 border-2 border-black w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 border-2 border-black w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                <div className="h-32 bg-gray-300 border-2 border-black mb-4"></div>
                <div className="h-4 bg-gray-200 border-2 border-black mb-2"></div>
                <div className="h-4 bg-gray-200 border-2 border-black w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Brutal Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-black mb-2 transform hover:scale-105 transition-transform">
                🏢 WORKSPACES
              </h1>
              <p className="text-lg font-bold text-gray-700">
                Collaboration spaces for your team
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-400 hover:bg-green-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 text-lg"
            >
              <Plus className="w-5 h-5" />
              NEW WORKSPACE
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
            />
          </div>
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace, index) => (
              <div
                key={workspace._id}
                className="cursor-pointer"
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <Card
                  className={`bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-all duration-200 ${
                    index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'
                  } hover:rotate-0 group`}
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black group-hover:text-blue-600 transition-colors line-clamp-1">
                        {workspace.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {workspace.settings.isPublic ? (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-600">PUBLIC</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-bold text-red-600">PRIVATE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleViewWorkspace(e, workspace._id)}
                      className="bg-blue-400 hover:bg-blue-300 border-3 border-black p-2 rounded-lg font-black text-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                      title="View Workspace"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleEditWorkspace(e, workspace._id)}
                      className="bg-yellow-400 hover:bg-yellow-300 border-3 border-black p-2 rounded-lg font-black text-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                      title="Edit Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {workspace.description && (
                  <div className="bg-gray-100 border-3 border-black rounded-xl p-3 mb-4">
                    <p className="text-sm font-bold text-gray-700 line-clamp-2">
                      {workspace.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-400 border-2 border-black rounded-lg p-2">
                      <Users className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-sm font-black text-black">
                      {workspace.members.length + 1} MEMBER{workspace.members.length > 0 ? 'S' : ''}
                    </span>
                  </div>
                  
                  <div className="bg-yellow-400 border-2 border-black rounded-lg px-2 py-1">
                    <span className="text-xs font-black text-black">
                      {new Date(workspace.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {workspace.tags && workspace.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {workspace.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-pink-400 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {workspace.tags.length > 3 && (
                      <span className="bg-gray-300 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs">
                        +{workspace.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-12 text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-16 h-16 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_#000]">
              <FolderOpen className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-3xl font-black text-black mb-4">
              {searchTerm ? 'NO WORKSPACES FOUND' : 'NO WORKSPACES YET'}
            </h3>
            <p className="text-lg font-bold text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first workspace!'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-400 hover:bg-blue-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                CREATE WORKSPACE
              </Button>
            )}
          </div>
        )}

        <CreateWorkspaceModal />
      </div>
    </div>
  );
};
