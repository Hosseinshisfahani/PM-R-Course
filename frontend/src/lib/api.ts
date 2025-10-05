// API client for Django backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  
  // Add CSRF token for non-GET requests
  if (init.method && init.method !== 'GET') {
    const csrftoken = document.cookie
      .split('; ')
      .find(c => c.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrftoken) {
      headers.set('X-CSRFToken', csrftoken);
    }
  }
  
  // Add content type for POST/PUT requests
  if (init.method && ['POST', 'PUT', 'PATCH'].includes(init.method)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
  const response = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers,
    credentials: 'include', // Include cookies for session auth
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
  }
  
  return response;
}

// Auth API
export const authApi = {
  async getProfile() {
    const response = await apiFetch('/auth/me/');
    return response.json();
  },
  
  async login(email: string, password: string) {
    const response = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  
  async logout() {
    const response = await apiFetch('/auth/logout/', {
      method: 'POST',
    });
    return response.json();
  },
  
  async signup(data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) {
    const response = await apiFetch('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Courses API
export const coursesApi = {
  async getCourses(params?: {
    category?: string;
    difficulty?: string;
    featured?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
    
    const query = searchParams.toString();
    const response = await apiFetch(`/courses/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async getCourse(slug: string) {
    const response = await apiFetch(`/courses/${slug}/`);
    return response.json();
  },
  
  async getCategories() {
    const response = await apiFetch('/courses/categories/');
    return response.json();
  },
  
  async getCategory(slug: string) {
    const response = await apiFetch(`/courses/categories/${slug}/`);
    return response.json();
  },
  
  async searchCourses(query: string) {
    const response = await apiFetch(`/courses/search/?q=${encodeURIComponent(query)}`);
    return response.json();
  },
  
  async getMyCourses() {
    const response = await apiFetch('/courses/my-courses/');
    return response.json();
  },
  
  async getSection(courseSlug: string, sectionId: number) {
    const response = await apiFetch(`/courses/${courseSlug}/sections/${sectionId}/`);
    return response.json();
  },
  
  async getVideo(courseSlug: string, videoId: number) {
    const response = await apiFetch(`/courses/${courseSlug}/videos/${videoId}/`);
    return response.json();
  },
};

// Cart API
export const cartApi = {
  async getCart() {
    const response = await apiFetch('/payments/cart/');
    return response.json();
  },
  
  async addToCart(data: { course_id?: number; section_id?: number }) {
    const response = await apiFetch('/payments/cart/add/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async removeFromCart(itemId: number) {
    const response = await apiFetch('/payments/cart/remove/', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    });
    return response.json();
  },
};

// Referral API
export const referralApi = {
  async validateCode(code: string) {
    const response = await apiFetch(`/payments/referral/validate/?code=${encodeURIComponent(code)}`);
    return response.json();
  },
  
  async applyCode(code: string) {
    const response = await apiFetch('/payments/referral/apply/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response.json();
  },
  
  async removeCode() {
    const response = await apiFetch('/payments/referral/apply/', {
      method: 'DELETE',
    });
    return response.json();
  },
  
  async trackCode(code: string) {
    const response = await apiFetch(`/payments/referral/track/?code=${encodeURIComponent(code)}`);
    return response.json();
  },
};

// Checkout API
export const checkoutApi = {
  async checkout() {
    const response = await apiFetch('/payments/checkout/', {
      method: 'POST',
    });
    return response.json();
  },
};

// Marketer API
export const marketerApi = {
  async createRequest(data: {
    full_name: string;
    phone_number: string;
    experience_level: string;
    current_job?: string;
    interest_area: string;
    motivation: string;
    marketing_experience?: string;
    instagram_handle?: string;
    telegram_handle?: string;
  }) {
    const response = await apiFetch('/payments/marketers/requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async getMyRequest() {
    const response = await apiFetch('/payments/marketers/requests/me/');
    return response.json();
  },
  
  async getCodes() {
    const response = await apiFetch('/payments/marketers/codes/');
    return response.json();
  },
  
  async createCode(data: {
    code?: string;
    discount_percentage: number;
    commission_percentage: number;
    max_uses?: number;
  }) {
    const response = await apiFetch('/payments/marketers/codes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async getCommissions() {
    const response = await apiFetch('/payments/marketers/commissions/');
    return response.json();
  },
};

// CSRF API
export const csrfApi = {
  async getToken() {
    const response = await apiFetch('/csrf/');
    return response.json();
  },
};
