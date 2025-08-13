'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Star, 
  BookOpen, 
  Download,
  Eye,
  Copy,
  Plus,
  Trash2,
  User,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Header } from '../layout/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  creator: {
    _id: string;
    username: string;
    email: string;
    profile?: {
      avatar?: string;
    };
  };
  isPublic: boolean;
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'project', label: 'Project' },
  { value: 'personal', label: 'Personal' },
  { value: 'study', label: 'Study' },
  { value: 'work', label: 'Work' },
  { value: 'creative', label: 'Creative' },
  { value: 'other', label: 'Other' }
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated, authLoading, selectedCategory, searchTerm, router]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '20');
      params.append('page', '1');

      const response = await api.get(`/templates?${params.toString()}`);
      
      if (response.data && response.data.templates) {
        setTemplates(response.data.templates);
      } else {
        setTemplates([]);
      }
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error(error.response?.data?.error || 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (template: Template) => {
    try {
      const response = await api.post('/notes', {
        title: `${template.name} - Copy`,
        content: template.content,
        category: template.category,
        tags: template.tags
      });

      if (response.data && response.data._id) {
        toast.success(`Created note from template: ${template.name}`);
        router.push(`/notes/${response.data._id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error using template:', error);
      toast.error(error.response?.data?.error || 'Failed to create note from template');
    }
  };

  const rateTemplate = async (templateId: string, rating: number) => {
    try {
      await api.post(`/templates/${templateId}/rate`, { rating });
      toast.success('Rating submitted successfully!');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error rating template:', error);
      toast.error(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/templates/${templateId}`);
      toast.success('Template deleted successfully!');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.response?.data?.error || 'Failed to delete template');
    }
  };

  const CreateTemplateModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      content: '',
      category: 'other',
      tags: [] as string[],
      isPublic: false
    });
    const [tagInput, setTagInput] = useState('');
    const [creating, setCreating] = useState(false);

    const handleAddTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim() || !formData.content.trim()) {
        toast.error('Name and content are required');
        return;
      }

      try {
        setCreating(true);
        await api.post('/templates', formData);
        toast.success('Template created successfully!');
        setShowCreateModal(false);
        fetchTemplates();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          content: '',
          category: 'other',
          tags: [],
          isPublic: false
        });
      } catch (error: any) {
        console.error('Error creating template:', error);
        toast.error(error.response?.data?.error || 'Failed to create template');
      } finally {
        setCreating(false);
      }
    };    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Template"
        maxWidth="2xl"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Template Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter template name"
              required
            />
            
            <div>
              <label className="block text-lg font-black text-black mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for"
                rows={2}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-lg font-black text-black mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-black text-black mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your template content (markdown supported)"
                rows={6}
                required
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-lg font-black text-black mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-4 py-2 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-400 hover:bg-blue-300 text-black font-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-yellow-400 border-2 border-black px-3 py-1 rounded-lg font-bold text-black text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-black hover:text-red-600 font-black"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-5 h-5 border-3 border-black rounded"
              />
              <label htmlFor="isPublic" className="font-bold text-black">
                Make this template public (others can use it)
              </label>
            </div>

            <div className="flex gap-4 pt-4 mt-6 border-t-2 border-gray-200 bg-white">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-200 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="flex-1 bg-green-400 hover:bg-green-300 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                {creating ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  const TemplatePreviewModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={selectedTemplate.name}
      >
        <div className="space-y-4">
          <div className="bg-gray-100 border-3 border-black rounded-xl p-4">
            <h3 className="text-lg font-black text-black mb-2">Description</h3>
            <p className="text-gray-700 font-bold">
              {selectedTemplate.description || 'No description provided'}
            </p>
          </div>

          <div className="bg-white border-3 border-black rounded-xl p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-black text-black mb-2">Content Preview</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {selectedTemplate.content}
            </pre>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowPreview(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-200 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                useTemplate(selectedTemplate);
                setShowPreview(false);
              }}
              className="flex-1 bg-blue-400 hover:bg-blue-300 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              Use Template
            </Button>
          </div>
        </div>
      </Modal>
    );
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 border-2 border-black mb-4"></div>
                  <div className="h-16 bg-gray-200 border-2 border-black mb-4"></div>
                  <div className="h-4 bg-gray-200 border-2 border-black w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-black mb-2 transform hover:scale-105 transition-transform">
                📚 TEMPLATE LIBRARY
              </h1>
              <p className="text-lg font-bold text-gray-700">
                Brutal templates to speed up your note creation
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-400 hover:bg-green-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 text-lg"
            >
              <Plus className="w-5 h-5" />
              CREATE TEMPLATE
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates by name, description, or tags..."
                  className="w-full pl-12 pr-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-4 border-black rounded-xl font-bold text-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-12 text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-black mb-2">NO TEMPLATES FOUND</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create a template!'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-400 hover:bg-blue-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                CREATE FIRST TEMPLATE
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Card
                key={template._id}
                className={`bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 transform hover:scale-105 transition-all duration-200 ${
                  index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'
                } hover:rotate-0`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black mb-2 line-clamp-2">
                      {template.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-600 line-clamp-3 mb-3">
                      {template.description || 'No description provided'}
                    </p>
                  </div>
                  
                  {template.creator._id === user?.id && (
                    <button
                      onClick={() => deleteTemplate(template._id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors ml-2"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-400 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs">
                    {template.category}
                  </span>
                  {template.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-yellow-400 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 2 && (
                    <span className="bg-gray-300 border-2 border-black px-2 py-1 rounded-lg font-bold text-black text-xs">
                      +{template.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm font-bold text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.usageCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{template.rating.average.toFixed(1)} ({template.rating.count})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {template.isPublic ? (
                      <Globe className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-600">
                  <User className="w-4 h-4" />
                  <span>by {template.creator.username}</span>
                  <span>•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    className="flex-1 bg-blue-400 hover:bg-blue-300 text-black font-black py-2 px-4 border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    PREVIEW
                  </Button>
                  
                  <Button
                    onClick={() => useTemplate(template)}
                    className="flex-1 bg-green-400 hover:bg-green-300 text-black font-black py-2 px-4 border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    USE
                  </Button>
                </div>

                {/* Rating */}
                <div className="mt-3 pt-3 border-t-2 border-black">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Rate:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => rateTemplate(template._id, star)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        <CreateTemplateModal />
        <TemplatePreviewModal />
      </div>
    </div>
  );
}