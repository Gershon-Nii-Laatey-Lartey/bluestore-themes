
import { KYCSubmissionData, KYCSubmissionResponse } from "./types";
import { kycApiService } from "./apiService";
import { kycFileUploadService } from "./fileUploadService";

export class KYCService {
  async getKYCSubmission(): Promise<KYCSubmissionResponse | null> {
    return await kycApiService.getKYCSubmission();
  }

  async createKYCSubmission(submission: Omit<KYCSubmissionData, 'id'>): Promise<KYCSubmissionResponse> {
    console.log('Creating KYC submission...');

    // Get the current user
    const user = await kycApiService.getCurrentUser();
    console.log('Creating KYC submission for user:', user.id);

    // Upload documents
    const documentUrls = await kycFileUploadService.uploadDocuments(
      submission.idDocument || null,
      submission.idDocumentBack || null,
      submission.selfieWithId || null,
      user.id
    );

    // Create the submission in the database
    const submissionData: KYCSubmissionData = {
      ...submission,
      status: submission.status || 'pending'
    };

    return await kycApiService.createKYCSubmission(submissionData, documentUrls);
  }

  async updateKYCSubmission(updates: Partial<KYCSubmissionResponse>): Promise<void> {
    return await kycApiService.updateKYCSubmission(updates);
  }

  async getAllKYCSubmissions(): Promise<any[]> {
    return await kycApiService.getAllKYCSubmissions();
  }

  async updateKYCStatus(id: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<void> {
    return await kycApiService.updateKYCStatus(id, status, rejectionReason);
  }
}

export const kycService = new KYCService();
