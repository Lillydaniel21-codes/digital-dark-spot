import {
  AuthResponse,
  DashboardSummary,
  ResearchProject,
  Source,
  Analysis,
  ChecklistItem,
  ChatMessage,
  HealthStatus,
  User,
  SearchSuggestionItem,
  SearchSuggestionResponse,
  SearchHistoryItem
} from '../types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('dds_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('dds_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('dds_token');
  localStorage.removeItem('dds_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  async requestCode(email: string) {
    return request<{ message: string; email: string; is_demo: boolean; demo_code?: string }>(
      '/auth/request-code',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  },

  async verifyCode(email: string, code: string) {
    const res = await request<AuthResponse>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    setAuthToken(res.access_token);
    localStorage.setItem('dds_user', JSON.stringify(res.user));
    return res;
  },

  async demoLogin() {
    const res = await request<AuthResponse>('/auth/demo-login', {
      method: 'POST',
    });
    setAuthToken(res.access_token);
    localStorage.setItem('dds_user', JSON.stringify(res.user));
    return res;
  },

  async getMe() {
    return request<User>('/auth/me');
  },

  // Health
  async getHealth() {
    return request<HealthStatus>('/health');
  },

  // Dashboard
  async getDashboardSummary() {
    return request<DashboardSummary>('/dashboard/summary');
  },

  // Research
  async listResearch() {
    return request<ResearchProject[]>('/research');
  },

  async createResearch(data: {
    title: string;
    research_question: string;
    topic?: string;
    location?: string;
    goal?: string;
    keywords?: string;
  }) {
    return request<ResearchProject>('/research', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getResearch(id: string) {
    return request<ResearchProject>(`/research/${id}`);
  },

  async deleteResearch(id: string) {
    return request<{ message: string }>(`/research/${id}`, {
      method: 'DELETE',
    });
  },

  async loadSampleResearch(domain?: string) {
    const url = domain ? `/research/load-sample?domain=${encodeURIComponent(domain)}` : '/research/load-sample';
    return request<ResearchProject>(url, {
      method: 'POST',
    });
  },

  // Sources
  async getSources(researchId: string) {
    return request<Source[]>(`/research/${researchId}/sources`);
  },

  async addUrlSource(researchId: string, url: string, title?: string) {
    return request<Source>(`/research/${researchId}/sources/url`, {
      method: 'POST',
      body: JSON.stringify({ url, title }),
    });
  },

  async uploadDocumentSource(researchId: string, file: File, title?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    return request<Source>(`/research/${researchId}/sources/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  async deleteSource(sourceId: string) {
    return request<{ message: string }>(`/sources/${sourceId}`, {
      method: 'DELETE',
    });
  },

  // Analysis & Gaps
  async runAnalysis(researchId: string) {
    return request<Analysis>(`/research/${researchId}/analyze`, {
      method: 'POST',
    });
  },

  async getAnalysis(researchId: string) {
    return request<Analysis>(`/research/${researchId}/analysis`);
  },

  async getChecklist(researchId: string) {
    return request<ChecklistItem[]>(`/research/${researchId}/checklist`);
  },

  async updateChecklistItem(itemId: string, is_completed: boolean) {
    return request<ChecklistItem>(`/checklist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed }),
    });
  },

  // Chatbot
  async sendChatMessage(researchId: string, question: string) {
    return request<ChatMessage>(`/research/${researchId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  async getChatHistory(researchId: string) {
    return request<{ id: string; research_id: string; messages: ChatMessage[] }>(
      `/research/${researchId}/chat/history`
    );
  },

  async clearChatHistory(researchId: string) {
    return request<{ message: string }>(`/research/${researchId}/chat/history`, {
      method: 'DELETE',
    });
  },

  // Search & Suggestions
  async getSearchSuggestions(query: string, domain?: string) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (domain && domain !== 'All Domains') params.set('domain', domain);
    return request<SearchSuggestionResponse>(`/search/suggestions?${params.toString()}`);
  },

  async getPopularSearches(domain?: string) {
    const params = new URLSearchParams();
    if (domain && domain !== 'All Domains') params.set('domain', domain);
    return request<SearchSuggestionItem[]>(`/search/popular?${params.toString()}`);
  },

  async getSearchHistory() {
    return request<SearchHistoryItem[]>('/search/history');
  },

  async addSearchHistory(query: string, domain?: string) {
    return request<SearchHistoryItem>('/search/history', {
      method: 'POST',
      body: JSON.stringify({ query, domain }),
    });
  },

  async clearSearchHistory() {
    return request<{ message: string }>('/search/history', {
      method: 'DELETE',
    });
  },

  // Reports
  async getReport(researchId: string) {
    return request<any>(`/research/${researchId}/report`);
  },

  async downloadPdfReport(researchId: string, filenameTitle: string = 'Report') {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/research/${researchId}/report/pdf`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF report.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InformationGapAudit_${filenameTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async downloadCsvReport(researchId: string, filenameTitle: string = 'Report') {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/research/${researchId}/report/csv`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download CSV report.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InformationGapAudit_${filenameTitle.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
