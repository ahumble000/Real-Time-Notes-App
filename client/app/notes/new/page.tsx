'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  FileText, 
  Save, 
  Eye, 
  ArrowLeft,
  BookOpen,
  Users,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const workspaceId = searchParams.get('workspace');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
    if (workspaceId) {
      setSelectedWorkspace(workspaceId);
    }
  }, [templateId, workspaceId]);

  const loadTemplate = async (id: string) => {
    try {
      setTemplateLoading(true);
      const response = await api.get(`/templates/${id}`);
      const template = response.data;
      
      setSelectedTemplate(template);
      setTitle(`${template.name} - Copy`);
      setContent(template.content);
      setCategory(template.category);
      setTags(template.tags || []);
      
      toast.success('Template loaded successfully!');
    } catch (error: any) {
      toast.error('Failed to load template');
      console.error('Error loading template:', error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      if (!title.trim()) {
        toast.error('Please enter a title');
        return;
      }

      try {
        setLoading(true);
        const noteData = {
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          isPublic,
          priority,
          ...(selectedWorkspace && { workspace: selectedWorkspace }),
          ...(selectedTemplate && { templateUsed: selectedTemplate._id })
        };

        const response = await api.post('/notes', noteData);
        toast.success('Note created successfully!');
        router.push(`/notes/${response.data._id}`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to create note');
      } finally {
        setLoading(false);
      }
    };

  const handleCancel = () => {
    router.push('/notes');
  };

  if (authLoading || templateLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000] transform rotate-1">
            <div className="bg-yellow-300 border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000] -rotate-2">
              <LoadingSpinner size="lg" variant="gentle" />
              <p className="mt-6 text-xl font-black text-black tracking-tight text-center">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'project', label: 'Project', icon: '🚀' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50">
      <Header 
        title="Create New Note" 
        showSearch={false}
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-700">
            {selectedTemplate ? `Using template: ${selectedTemplate.name}` : 'Start writing your thoughts'}
          </p>
          <Button
            onClick={handleCancel}
            variant="secondary"
            size="sm"
          >
            Back to Notes
          </Button>
        </div>
      </Header>
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Note</h1>
                {selectedTemplate && (
                  <div className="flex items-center space-x-2 mt-1">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-600">
                      Using template: <span className="font-medium">{selectedTemplate.name}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/templates')}
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse Templates</span>
              </Button>
              
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Create Note</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="default" className="p-6 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <InputField
                    label="Note Title"
                    value={title}
                    onChange={setTitle}
                    placeholder="Enter your note title..."
                    required
                    disabled={loading}
                  />

                  <div>
                    <label className="block text-lg font-black text-black mb-3 tracking-tight">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start writing your note..."
                      rows={20}
                      disabled={loading}
                      className="w-full px-4 py-3 border-4 border-black rounded-2xl font-bold text-black placeholder-gray-500 bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
                    />
                    <p className="mt-2 text-sm font-bold text-gray-600">
                      Supports Markdown formatting • {content.length} characters
                    </p>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Note Settings */}
              <Card variant="warning" className="p-6 bg-yellow-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-4 tracking-tight">Note Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-black text-black mb-2 tracking-tight">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-black text-black mb-2 tracking-tight">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                    >
                      {priorities.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      disabled={loading}
                      className="w-5 h-5 border-3 border-black rounded focus:outline-none"
                    />
                    <label htmlFor="isPublic" className="text-lg font-black text-black tracking-tight">
                      Make this note public
                    </label>
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card variant="primary" className="p-6 bg-blue-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-4 tracking-tight flex items-center space-x-2">
                  <Tag className="w-6 h-6" />
                  <span>Tags</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      disabled={loading}
                      className="flex-1 px-3 py-2 border-4 border-black rounded-xl font-bold text-black placeholder-gray-500 bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || loading}
                      variant="brutal"
                      className="bg-green-400 hover:bg-green-300"
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-black bg-pink-400 border-3 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-red-400 hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Template Info */}
              {selectedTemplate && (
                <Card variant="brutal" className="p-6 bg-gradient-to-br from-pink-400 to-purple-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] transform rotate-1">
                  <h3 className="text-xl font-black text-black mb-2 tracking-tight flex items-center space-x-2">
                    <BookOpen className="w-6 h-6" />
                    <span>Template Used</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-lg font-black text-black">
                      {selectedTemplate.name}
                    </p>
                    {selectedTemplate.description && (
                      <p className="text-sm font-bold text-gray-800">
                        {selectedTemplate.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-black bg-blue-400 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                        {selectedTemplate.category}
                      </span>
                      {selectedTemplate.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs font-black bg-purple-400 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card variant="success" className="p-6 bg-green-400 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000]">
                <h3 className="text-xl font-black text-black mb-4 tracking-tight">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="brutal"
                    onClick={() => window.open(`/notes/preview?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`, '_blank')}
                    disabled={!content.trim()}
                    className="w-full justify-start bg-white hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Note
                  </Button>
                  
                  <Button
                    variant="brutal"
                    onClick={() => router.push('/workspaces')}
                    className="w-full justify-start bg-white hover:bg-gray-100"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add to Workspace
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
