
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { kycService } from "@/services/kycService";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";
import { PersonalStoreForm } from "@/components/kyc/PersonalStoreForm";
import { IDVerificationForm } from "@/components/kyc/IDVerificationForm";
import { KYCHeader } from "@/components/kyc/KYCHeader";
import { KYCProgressIndicator } from "@/components/kyc/KYCProgressIndicator";
import { KYCInfoCard } from "@/components/kyc/KYCInfoCard";

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal & Store Info
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    storeName: '',
    storeDescription: '',
    productCategory: '',
    location: '',
    
    // ID Verification
    documentType: '',
    holderName: '',
    dateOfBirth: '',
    gender: '',
    licenseNumber: '',
    idNumber: '',
    votersNumber: '',
    idDocumentFront: null as File | null,
    idDocumentBack: null as File | null,
    selfieWithId: null as File | null,
    
    // Consent
    agreeTerms: false,
    confirmInfo: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (checked: boolean, field: string) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleContinue = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await kycService.createKYCSubmission({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        productCategory: formData.productCategory,
        location: formData.location,
        idDocument: formData.idDocumentFront,
        idDocumentBack: formData.idDocumentBack,
        selfieWithId: formData.selfieWithId,
        agreeTerms: formData.agreeTerms,
        confirmInfo: formData.confirmInfo,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });

      // Notify admins about the KYC submission
      if (user) {
        try {
          await notificationService.notifyAdminsForKYCSubmission(
            user.id, 
            formData.fullName || user.email || 'Unknown User'
          );
        } catch (notificationError) {
          console.error('Error notifying admins:', notificationError);
          // Don't fail the submission if notification fails
        }
      }
      
      toast({
        title: "KYC Submitted",
        description: "Your verification documents have been submitted for review. You'll be notified within 24-48 hours."
      });
      
      navigate('/verification-success');
    } catch (error) {
      console.error('KYC submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit KYC application. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto">
        <KYCHeader currentStep={currentStep} />
        <KYCInfoCard />
        <KYCProgressIndicator currentStep={currentStep} />

        {currentStep === 1 ? (
          <PersonalStoreForm
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onContinue={handleContinue}
          />
        ) : (
          <IDVerificationForm
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCheckboxChange={handleCheckboxChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}
      </div>
    </Layout>
  );
};

export default KYC;
