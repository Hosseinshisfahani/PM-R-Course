// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  user_type: 'customer' | 'staff' | 'admin';
  phone_number?: string;
  birth_date?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
  is_staff_member: boolean;
  is_admin_user: boolean;
  is_customer: boolean;
}

// Course types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  course_count: number;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  video_file: string;
  duration_seconds: number;
  duration_formatted: string;
  order: number;
  is_preview: boolean;
  created_at: string;
}

export interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  price: number;
  is_free: boolean;
  total_videos: number;
  duration: string;
  videos: Video[];
  created_at: string;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description: string;
  category_name: string;
  instructor_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effective_price: number;
  is_free: boolean;
  duration_hours: number;
  total_sections: number;
  total_videos: number;
  average_rating?: number;
  review_count: number;
  thumbnail?: string;
  preview_video?: string;
  is_featured: boolean;
  is_published: boolean;
  sections?: Section[];
  reviews?: Review[];
  is_enrolled?: boolean;
  created_at: string;
  updated_at?: string;
}

// Cart types
export interface CartItem {
  id: number;
  course?: Course;
  course_id?: number;
  section_id?: number;
  item_title: string;
  item_price: number;
  added_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  total_items: number;
  referral_code?: string;
  created_at: string;
  updated_at: string;
}

// Referral types
export interface ReferralCode {
  id: number;
  code: string;
  discount_percentage: number;
  commission_percentage: number;
  is_active: boolean;
  max_uses?: number;
  current_uses: number;
  marketer_name: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralValidation {
  valid: boolean;
  discount_type?: string;
  value?: number;
  reason?: string;
}

// Marketer types
export interface MarketerRequest {
  id: number;
  user_name: string;
  full_name: string;
  phone_number: string;
  email: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  experience_display: string;
  current_job?: string;
  interest_area: 'medical' | 'technology' | 'business' | 'education' | 'all';
  interest_display: string;
  motivation: string;
  marketing_experience?: string;
  instagram_handle?: string;
  telegram_handle?: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketerCommission {
  id: number;
  referral_code: string;
  customer_name: string;
  purchase_amount: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  status_display: string;
  created_at: string;
  paid_at?: string;
}

export interface MarketerCommissions {
  commissions: MarketerCommission[];
  totals: {
    total: number;
    pending: number;
    paid: number;
  };
}

// Purchase types
export interface Purchase {
  id: string;
  purchase_type: 'course' | 'section';
  course_title?: string;
  section_title?: string;
  amount: number;
  original_amount?: number;
  discount_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_status_display: string;
  transaction_id?: string;
  payment_method: string;
  referral_code?: string;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}
