
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { ImagePreview } from "./ImagePreview";

interface DocumentUploadSectionProps {
  selectedDocType: string;
  formData: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onRemoveFile: (field: string) => void;
}

export const DocumentUploadSection = ({ 
  selectedDocType, 
  formData, 
  onFileChange, 
  onRemoveFile 
}: DocumentUploadSectionProps) => {
  if (!selectedDocType) return null;

  const getDocumentName = () => {
    switch (selectedDocType) {
      case 'license':
        return 'License';
      case 'ghana_card':
        return 'Ghana Card';
      case 'voters_id':
        return "Voter's ID";
      default:
        return 'Document';
    }
  };

  const showBackUpload = selectedDocType === 'license' || selectedDocType === 'ghana_card';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Front of {getDocumentName()} *</Label>
          {formData.idDocumentFront ? (
            <ImagePreview
              file={formData.idDocumentFront}
              onRemove={() => onRemoveFile('idDocumentFront')}
              label={`Front of ${getDocumentName()}`}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="idDocumentFront"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => onFileChange(e, 'idDocumentFront')}
                className="hidden"
                required
              />
              <label htmlFor="idDocumentFront" className="cursor-pointer flex items-center justify-center space-x-2">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Upload Front Image</span>
              </label>
            </div>
          )}
        </div>

        {showBackUpload && (
          <div>
            <Label>Back of {getDocumentName()} *</Label>
            {formData.idDocumentBack ? (
              <ImagePreview
                file={formData.idDocumentBack}
                onRemove={() => onRemoveFile('idDocumentBack')}
                label={`Back of ${getDocumentName()}`}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="idDocumentBack"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => onFileChange(e, 'idDocumentBack')}
                  className="hidden"
                  required
                />
                <label htmlFor="idDocumentBack" className="cursor-pointer flex items-center justify-center space-x-2">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Upload Back Image</span>
                </label>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
