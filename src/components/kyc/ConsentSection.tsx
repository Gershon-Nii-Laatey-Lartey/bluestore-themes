
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentSectionProps {
  selectedDocType: string;
  formData: any;
  onCheckboxChange: (checked: boolean, field: string) => void;
}

export const ConsentSection = ({ selectedDocType, formData, onCheckboxChange }: ConsentSectionProps) => {
  if (!selectedDocType) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="confirmInfo" 
            checked={formData.confirmInfo}
            onCheckedChange={(checked) => onCheckboxChange(checked as boolean, 'confirmInfo')}
            required
          />
          <Label htmlFor="confirmInfo" className="text-sm">
            I confirm the information provided is correct
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="agreeTerms" 
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => onCheckboxChange(checked as boolean, 'agreeTerms')}
            required
          />
          <Label htmlFor="agreeTerms" className="text-sm">
            I agree to the Terms and Conditions
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
