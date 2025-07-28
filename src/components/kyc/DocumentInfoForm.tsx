
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentInfoFormProps {
  selectedDocType: string;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string, field: string) => void;
}

export const DocumentInfoForm = ({ 
  selectedDocType, 
  formData, 
  onInputChange, 
  onSelectChange 
}: DocumentInfoFormProps) => {
  if (!selectedDocType) return null;

  const getDocumentTitle = () => {
    switch (selectedDocType) {
      case 'license':
        return "Driver's License";
      case 'ghana_card':
        return 'Ghana Card';
      case 'voters_id':
        return "Voter's ID";
      default:
        return 'Document';
    }
  };

  const renderDocumentNumberField = () => {
    if (selectedDocType === 'license') {
      return (
        <div>
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input 
            id="licenseNumber" 
            value={formData.licenseNumber || ''}
            onChange={onInputChange}
            required
          />
        </div>
      );
    } else if (selectedDocType === 'ghana_card') {
      return (
        <div>
          <Label htmlFor="idNumber">ID Number *</Label>
          <Input 
            id="idNumber" 
            value={formData.idNumber || ''}
            onChange={onInputChange}
            placeholder="GHA-xxxxxxxxx-x"
            required
          />
        </div>
      );
    } else if (selectedDocType === 'voters_id') {
      return (
        <div>
          <Label htmlFor="votersNumber">Voter's ID Number *</Label>
          <Input 
            id="votersNumber" 
            value={formData.votersNumber || ''}
            onChange={onInputChange}
            required
          />
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getDocumentTitle()} Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="holderName">Full Name of Holder *</Label>
            <Input 
              id="holderName" 
              value={formData.holderName || ''}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input 
                id="dateOfBirth" 
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={onInputChange}
                required
              />
            </div>
            <div>
              <Label>Gender *</Label>
              <Select onValueChange={(value) => onSelectChange(value, 'gender')} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderDocumentNumberField()}
        </div>
      </CardContent>
    </Card>
  );
};
