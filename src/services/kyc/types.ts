
export interface KYCSubmissionData {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  storeName: string;
  storeDescription: string;
  productCategory: string;
  location: string;
  idDocument?: File | null;
  idDocumentBack?: File | null;
  selfieWithId?: File | null;
  agreeTerms: boolean;
  confirmInfo: boolean;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface KYCSubmissionResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  storeName: string;
  storeDescription: string;
  productCategory: string;
  location: string;
  idDocument: File | null;
  idDocumentBack: File | null;
  selfieWithId: File | null;
  agreeTerms: boolean;
  confirmInfo: boolean;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface KYCDatabaseRow {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  store_name: string;
  store_description: string;
  product_category: string;
  location: string;
  id_document_url: string | null;
  id_document_back_url: string | null;
  selfie_with_id_url: string | null;
  agree_terms: boolean;
  confirm_info: boolean;
  submitted_at: string;
  status: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}
