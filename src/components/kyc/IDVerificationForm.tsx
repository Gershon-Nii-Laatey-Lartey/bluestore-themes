
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { DocumentInfoForm } from "./DocumentInfoForm";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { SelfieUploadSection } from "./SelfieUploadSection";
import { ConsentSection } from "./ConsentSection";

interface IDVerificationFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string, field: string) => void;
  onCheckboxChange: (checked: boolean, field: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const IDVerificationForm = ({ 
  formData, 
  onInputChange, 
  onSelectChange,
  onCheckboxChange,
  onFileChange, 
  onSubmit,
  onBack 
}: IDVerificationFormProps) => {
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const handleDocTypeChange = (value: string) => {
    setSelectedDocType(value);
    onSelectChange(value, 'documentType');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    onFileChange(e, field);
  };

  const handleRemoveFile = (field: string) => {
    // Create a synthetic event to clear the file
    const syntheticEvent = {
      target: { files: null }
    } as React.ChangeEvent<HTMLInputElement>;
    onFileChange(syntheticEvent, field);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <DocumentTypeSelector 
        selectedDocType={selectedDocType}
        onDocTypeChange={handleDocTypeChange}
      />

      <DocumentInfoForm 
        selectedDocType={selectedDocType}
        formData={formData}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
      />

      <DocumentUploadSection 
        selectedDocType={selectedDocType}
        formData={formData}
        onFileChange={handleFileUpload}
        onRemoveFile={handleRemoveFile}
      />

      <SelfieUploadSection 
        selectedDocType={selectedDocType}
        formData={formData}
        onFileChange={handleFileUpload}
        onRemoveFile={handleRemoveFile}
      />

      <ConsentSection 
        selectedDocType={selectedDocType}
        formData={formData}
        onCheckboxChange={onCheckboxChange}
      />

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {selectedDocType && (
          <Button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!formData.confirmInfo || !formData.agreeTerms}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit for Verification
          </Button>
        )}
      </div>
    </form>
  );
};
