
export interface AdPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  bestFor: string;
  color: string;
  icon: React.ComponentType<any>;
  recommended?: boolean;
  popular?: boolean;
  adsAllowed?: number | null; // null means unlimited
}

export interface ProductSubmission {
  id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  price: string;
  originalPrice: string;
  negotiable: boolean;
  phone: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed' | 'processing' | 'expired' | 'draft';
  submittedAt: string;
  images?: string[];
  user_id?: string;
  edited?: boolean;
  previous_price?: string;
  package?: AdPackage;
  rejection_reason?: string;
  suggestions?: string;
  main_image_index?: number;
  packagePrice?: number;
  created_at?: string;
  updated_at?: string;
  boost_level?: 'none' | 'boost' | '2x_boost';
}
