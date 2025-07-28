
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { ImagePreview } from "./ImagePreview";

interface SelfieUploadSectionProps {
  selectedDocType: string;
  formData: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onRemoveFile: (field: string) => void;
}

export const SelfieUploadSection = ({ 
  selectedDocType, 
  formData, 
  onFileChange, 
  onRemoveFile 
}: SelfieUploadSectionProps) => {
  if (!selectedDocType) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Selfie with ID *</Label>
          <p className="text-sm text-gray-500 mb-2">Take a selfie holding your ID to verify it's real</p>
          {formData.selfieWithId ? (
            <ImagePreview
              file={formData.selfieWithId}
              onRemove={() => onRemoveFile('selfieWithId')}
              label="Selfie with ID"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="selfieWithId"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => onFileChange(e, 'selfieWithId')}
                className="hidden"
                required
              />
              <label htmlFor="selfieWithId" className="cursor-pointer flex items-center justify-center space-x-2">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Upload Selfie with ID</span>
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
