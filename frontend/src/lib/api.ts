// API client for Django backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Persian error messages
function getPersianErrorMessage(status: number, originalMessage?: string): string {
  // Common error messages
  const errorMessages: { [key: string]: string } = {
    'Invalid referral code': 'کد معرفی نامعتبر است',
    'Referral code not found': 'کد معرفی یافت نشد',
    'Referral code is not active': 'کد معرفی غیرفعال است',
    'Referral code has reached maximum uses': 'کد معرفی به حداکثر استفاده رسیده است',
    'You already have a pending request': 'شما قبلاً درخواست عضویت ثبت کرده‌اید',
    'Authentication required': 'نیاز به ورود به سیستم',
    'Permission denied': 'دسترسی مجاز نیست',
    'User not found': 'کاربر یافت نشد',
    'Invalid credentials': 'اطلاعات ورود نامعتبر',
    'Network error': 'خطا در اتصال به سرور',
    'Server error': 'خطای سرور',
    'Validation error': 'خطا در اعتبارسنجی',
    'Already exists': 'قبلاً وجود دارد',
    'Not found': 'یافت نشد',
    'Unauthorized': 'غیرمجاز',
    'Forbidden': 'ممنوع',
    'Bad request': 'درخواست نامعتبر',
    'Internal server error': 'خطای داخلی سرور',
    'Service unavailable': 'سرویس در دسترس نیست',
    'Timeout': 'زمان اتصال به پایان رسید'
  };

  // Check if original message has a Persian translation
  if (originalMessage && errorMessages[originalMessage]) {
    return errorMessages[originalMessage];
  }

  // Status code based messages
  switch (status) {
    case 400:
      return 'درخواست نامعتبر است';
    case 401:
      return 'نیاز به ورود به سیستم';
    case 403:
      return 'دسترسی مجاز نیست';
    case 404:
      return 'صفحه یا اطلاعات مورد نظر یافت نشد';
    case 409:
      return 'تضاد در اطلاعات - ممکن است قبلاً وجود داشته باشد';
    case 422:
      return 'خطا در اعتبارسنجی اطلاعات';
    case 500:
      return 'خطای داخلی سرور';
    case 502:
      return 'خطا در ارتباط با سرور';
    case 503:
      return 'سرویس موقتاً در دسترس نیست';
    default:
      return originalMessage || 'خطای نامشخص رخ داده است';
  }
}

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
  
  try {
    const response = await fetch(`${API_BASE}${input}`, {
      ...init,
      headers,
      credentials: 'include', // Include cookies for session auth
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const persianMessage = getPersianErrorMessage(response.status, errorData.error || errorData.message);
      throw new ApiError(response.status, persianMessage);
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: Unable to connect to backend server. Make sure Django is running on', API_BASE);
      console.error('Full error:', error);
      throw new ApiError(0, 'Backend server is not running. Please start the Django server.');
    }
    throw error;
  }
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
  
  async getPackages() {
    const response = await apiFetch('/courses/packages/');
    return response.json();
  },
  
  async getPackage(slug: string) {
    const response = await apiFetch(`/courses/packages/${slug}/`);
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
  
  async updateCode(codeId: number, data: {
    is_active?: boolean;
    discount_percentage?: number;
    commission_percentage?: number;
    max_uses?: number;
  }) {
    const response = await apiFetch(`/payments/marketers/codes/${codeId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async deleteCode(codeId: number) {
    const response = await apiFetch(`/payments/marketers/codes/${codeId}/`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Admin API
export const adminApi = {
  async getDashboardStats() {
    const response = await apiFetch('/admin/dashboard/stats/');
    return response.json();
  },
  
  async getUsers(params?: {
    search?: string;
    user_type?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.user_type) searchParams.set('user_type', params.user_type);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/users/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async updateUser(userId: number, data: {
    user_type?: string;
    is_active?: boolean;
  }) {
    const response = await apiFetch(`/admin/users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async getMarketerRequests(params?: {
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/marketer-requests/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async approveMarketerRequest(requestId: number, adminNotes?: string) {
    const response = await apiFetch(`/admin/marketer-requests/${requestId}/`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        admin_notes: adminNotes,
      }),
    });
    return response.json();
  },
  
  async rejectMarketerRequest(requestId: number, adminNotes?: string) {
    const response = await apiFetch(`/admin/marketer-requests/${requestId}/`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        admin_notes: adminNotes,
      }),
    });
    return response.json();
  },
  
  async getMarketers(params?: {
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/marketers/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async getReferralCodes(params?: {
    is_active?: boolean;
    marketer_id?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) searchParams.set('is_active', params.is_active.toString());
    if (params?.marketer_id) searchParams.set('marketer_id', params.marketer_id.toString());
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/referral-codes/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async updateReferralCode(codeId: number, data: {
    is_active?: boolean;
    max_uses?: number;
    discount_percentage?: number;
    commission_percentage?: number;
  }) {
    const response = await apiFetch(`/admin/referral-codes/${codeId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async deleteReferralCode(codeId: number) {
    const response = await apiFetch(`/admin/referral-codes/${codeId}/`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  async getReferralCodeSettings() {
    const response = await apiFetch('/admin/referral-code-settings/');
    return response.json();
  },
  
  async updateReferralCodeSettings(data: {
    default_discount_percentage: number;
    default_commission_percentage: number;
  }) {
    const response = await apiFetch('/admin/referral-code-settings/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async getPurchases(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/purchases/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async getCommissions(params?: {
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/commissions/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async markCommissionPaid(commissionId: number) {
    const response = await apiFetch(`/admin/commissions/${commissionId}/mark-paid/`, {
      method: 'POST',
    });
    return response.json();
  },
  
  async getCourses(params?: {
    search?: string;
    is_published?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.is_published !== undefined) searchParams.set('is_published', params.is_published.toString());
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/courses/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async updateCourse(courseId: number, data: {
    is_published?: boolean;
    is_featured?: boolean;
  }) {
    const response = await apiFetch(`/admin/courses/${courseId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async deleteCourse(courseId: number) {
    const response = await apiFetch(`/admin/courses/${courseId}/`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  async getPackages(params?: {
    search?: string;
    is_published?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.is_published !== undefined) searchParams.set('is_published', params.is_published.toString());
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/packages/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async updatePackage(packageId: number, data: {
    is_published?: boolean;
    is_featured?: boolean;
  }) {
    const response = await apiFetch(`/admin/packages/${packageId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async deletePackage(packageId: number) {
    const response = await apiFetch(`/admin/packages/${packageId}/`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  async getTickets(params?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.category) searchParams.set('category', params.category);
    
    const query = searchParams.toString();
    const response = await apiFetch(`/admin/tickets/${query ? `?${query}` : ''}`);
    return response.json();
  },
  
  async getTicket(ticketId: number) {
    const response = await apiFetch(`/admin/tickets/${ticketId}/`);
    return response.json();
  },
  
  async updateTicket(ticketId: number, data: {
    status?: string;
    priority?: string;
    assigned_to?: number;
  }) {
    const response = await apiFetch(`/admin/tickets/${ticketId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async replyToTicket(ticketId: number, message: string) {
    const response = await apiFetch(`/admin/tickets/${ticketId}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return response.json();
  },
};

// Tickets API (for users)
export const ticketsApi = {
  async getMyTickets() {
    const response = await apiFetch('/tickets/');
    return response.json();
  },
  
  async getTicket(ticketId: number) {
    const response = await apiFetch(`/tickets/${ticketId}/`);
    return response.json();
  },
  
  async createTicket(data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
  }) {
    const response = await apiFetch('/tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async replyToTicket(ticketId: number, message: string) {
    const response = await apiFetch(`/tickets/${ticketId}/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
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
