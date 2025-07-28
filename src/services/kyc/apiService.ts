
import { supabase } from "@/integrations/supabase/client";
import { KYCSubmissionData, KYCSubmissionResponse, KYCDatabaseRow } from "./types";
import { kycNotificationService } from "./kycNotificationService";

export class KYCApiService {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  private transformDatabaseRowToResponse(row: KYCDatabaseRow): KYCSubmissionResponse {
    return {
      id: row.id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      email: row.email,
      address: row.address,
      storeName: row.store_name,
      storeDescription: row.store_description,
      productCategory: row.product_category,
      location: row.location,
      idDocument: null, // Files are stored as URLs, not File objects
      idDocumentBack: null,
      selfieWithId: null,
      agreeTerms: row.agree_terms,
      confirmInfo: row.confirm_info,
      submittedAt: row.submitted_at,
      status: row.status as 'pending' | 'approved' | 'rejected'
    };
  }

  async getKYCSubmission(): Promise<KYCSubmissionResponse | null> {
    console.log('Fetching KYC submission...');
    
    const user = await this.getCurrentUser();
    
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching KYC submission:', error);
      throw error;
    }

    if (!data) {
      console.log('No KYC submission found');
      return null;
    }

    console.log('KYC submission fetched:', data);
    return this.transformDatabaseRowToResponse(data);
  }

  async createKYCSubmission(
    submission: KYCSubmissionData, 
    documentUrls: { idDocumentUrl?: string; idDocumentBackUrl?: string; selfieWithIdUrl?: string }
  ): Promise<KYCSubmissionResponse> {
    console.log('Creating KYC submission in database...');
    
    const user = await this.getCurrentUser();

    const submissionData = {
      user_id: user.id,
      full_name: submission.fullName,
      phone_number: submission.phoneNumber,
      email: submission.email,
      address: submission.address,
      store_name: submission.storeName,
      store_description: submission.storeDescription,
      product_category: submission.productCategory,
      location: submission.location,
      id_document_url: documentUrls.idDocumentUrl,
      id_document_back_url: documentUrls.idDocumentBackUrl,
      selfie_with_id_url: documentUrls.selfieWithIdUrl,
      agree_terms: submission.agreeTerms,
      confirm_info: submission.confirmInfo,
      status: submission.status || 'pending'
    };

    const { data, error } = await supabase
      .from('kyc_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating KYC submission:', error);
      throw error;
    }

    console.log('KYC submission created successfully:', data);
    return this.transformDatabaseRowToResponse(data);
  }

  async updateKYCSubmission(updates: Partial<KYCSubmissionResponse>): Promise<void> {
    console.log('Updating KYC submission...');
    
    const user = await this.getCurrentUser();

    const { error } = await supabase
      .from('kyc_submissions')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating KYC submission:', error);
      throw error;
    }

    console.log('KYC submission updated successfully');
  }

  async getAllKYCSubmissions(): Promise<any[]> {
    console.log('Fetching all KYC submissions for admin...');
    
    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC submissions:', error);
      throw error;
    }

    console.log('KYC submissions fetched:', data?.length);
    return data || [];
  }

  async updateKYCStatus(id: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<void> {
    console.log('Updating KYC status...', { id, status, rejectionReason });
    
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: (await this.getCurrentUser()).id
    };

    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data, error } = await supabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', id)
      .select('user_id')
      .single();

    if (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }

    console.log('KYC status updated successfully');

    // Send notification based on status
    if (status === 'approved') {
      // The approval notification will be automatically sent by the database trigger
      await kycNotificationService.sendKYCApprovalNotification(data.user_id, id);
    } else if (status === 'rejected' && rejectionReason) {
      // Send rejection notification manually
      await kycNotificationService.sendKYCRejectionNotification(data.user_id, rejectionReason);
    }
  }
}

export const kycApiService = new KYCApiService();
