
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

interface DocumentTypeSelectorProps {
  selectedDocType: string;
  onDocTypeChange: (value: string) => void;
}

export const DocumentTypeSelector = ({ selectedDocType, onDocTypeChange }: DocumentTypeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Select Document Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Choose ID Document Type *</Label>
        <Select onValueChange={onDocTypeChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="license">Driver's License</SelectItem>
            <SelectItem value="ghana_card">Ghana Card</SelectItem>
            <SelectItem value="voters_id">Voter's ID</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
