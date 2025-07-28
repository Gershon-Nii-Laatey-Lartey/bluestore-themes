
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";
import { useState } from "react";

interface ProductRejectionModalProps {
  productTitle: string;
  onReject: (reason: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ProductRejectionModal = ({ 
  productTitle, 
  onReject, 
  onCancel, 
  isSubmitting = false 
}: ProductRejectionModalProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(reason.trim());
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Reject Product
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            You are about to reject: <span className="font-medium">"{productTitle}"</span>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Reason for rejection *</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Please provide a clear reason for rejecting this product submission..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            This reason will be visible to the vendor to help them improve their submission.
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Rejecting..." : "Reject Product"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
