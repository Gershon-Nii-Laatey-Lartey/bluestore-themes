
import { supabase } from "@/integrations/supabase/client";

export class KYCFileUploadService {
  private readonly bucketName = 'kyc-documents';

  async uploadFile(file: File, userId: string, fileType: string): Promise<string | null> {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${fileType}-${Date.now()}.${fileExtension}`;
      
      console.log(`Uploading ${fileType}...`);
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file);
      
      if (error) {
        console.error(`Error uploading ${fileType}:`, error);
        return null;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);
      
      console.log(`${fileType} uploaded successfully. Public URL:`, publicUrl);
      return publicUrl;
    } catch (error) {
      console.error(`Unexpected error uploading ${fileType}:`, error);
      return null;
    }
  }

  async uploadDocuments(
    idDocument: File | null,
    idDocumentBack: File | null,
    selfieWithId: File | null,
    userId: string
  ): Promise<{
    idDocumentUrl: string | null;
    idDocumentBackUrl: string | null;
    selfieWithIdUrl: string | null;
  }> {
    const uploadPromises = [];
    
    if (idDocument) {
      uploadPromises.push(this.uploadFile(idDocument, userId, 'id-document'));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }
    
    if (idDocumentBack) {
      uploadPromises.push(this.uploadFile(idDocumentBack, userId, 'id-document-back'));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }
    
    if (selfieWithId) {
      uploadPromises.push(this.uploadFile(selfieWithId, userId, 'selfie-with-id'));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }

    const [idDocumentUrl, idDocumentBackUrl, selfieWithIdUrl] = await Promise.all(uploadPromises);

    return {
      idDocumentUrl,
      idDocumentBackUrl,
      selfieWithIdUrl
    };
  }
}

export const kycFileUploadService = new KYCFileUploadService();
