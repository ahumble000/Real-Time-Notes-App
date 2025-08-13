// API integration helper for the enhanced features
// This file contains utility functions to integrate the new features with your existing API

export class EnhancedNotesAPI {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  private static async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Analytics API
  static async getAnalytics(period: string = '30d') {
    return this.request(`/analytics/dashboard?period=${period}`);
  }

  static async getProductivityData(timeframe: string = 'week') {
    return this.request(`/analytics/productivity?timeframe=${timeframe}`);
  }

  static async getActivityData() {
    return this.request('/analytics/activity');
  }

  // Templates API
  static async getTemplates(params: { category?: string; search?: string } = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/templates?${query}`);
  }

  static async getTemplate(id: string) {
    return this.request(`/templates/${id}`);
  }

  static async createTemplate(data: any) {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async useTemplate(id: string) {
    return this.request(`/templates/${id}/use`, {
      method: 'POST',
    });
  }

  // Workspaces API
  static async getWorkspaces() {
    return this.request('/workspaces');
  }

  static async getWorkspace(id: string) {
    return this.request(`/workspaces/${id}`);
  }

  static async createWorkspace(data: any) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateWorkspace(id: string, data: any) {
    return this.request(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async inviteToWorkspace(id: string, data: { email: string; role: string }) {
    return this.request(`/workspaces/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async removeMember(workspaceId: string, memberId: string) {
    return this.request(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  static async updateMemberRole(workspaceId: string, memberId: string, role: string) {
    return this.request(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // User Settings API
  static async getUserProfile() {
    return this.request('/users/profile');
  }

  static async updateUserProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Enhanced Notes API
  static async createNoteWithExtras(data: any) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateNoteExtras(id: string, data: any) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export default EnhancedNotesAPI;
