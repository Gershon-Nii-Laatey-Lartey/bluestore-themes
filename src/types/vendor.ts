
export interface VendorProfile {
  id: string;
  businessName: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  categories: string[];
  profileImage?: File | null;
  coverImage?: File | null;
  shippingPolicy: string;
  returnPolicy: string;
  warrantyInfo: string;
  createdAt: string;
  verified: boolean;
  totalProducts: number;
  user_id?: string;
  storefrontUrl?: string;
  storefrontEnabled?: boolean;
}
