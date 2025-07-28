import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { Flag } from "lucide-react";

interface ReportAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

export const ReportAdModal = ({ isOpen, onClose, productId, productTitle }: ReportAdModalProps) => {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: "spam", label: "Spam or duplicate listing" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "fraud", label: "Fraudulent or scam" },
    { value: "fake", label: "Fake or counterfeit product" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('product_reports')
        .insert({
          product_id: productId,
          reporter_id: user.user?.id,
          report_type: reportType,
          description: description.trim() || null
        });

      if (error) throw error;

      // Notify admins about the report
      if (user.user) {
        try {
          const userName = user.user.user_metadata?.full_name || user.user.email || 'Unknown User';
          await notificationService.notifyAdminsForReport(
            user.user.id,
            userName,
            reportType,
            productTitle
          );
        } catch (notificationError) {
          console.error('Error notifying admins:', notificationError);
          // Don't fail the report submission if notification fails
        }
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this ad. We'll review it shortly.",
      });

      onClose();
      setReportType("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Ad
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Product</Label>
            <p className="text-sm text-muted-foreground">{productTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for reporting" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about why you're reporting this ad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};