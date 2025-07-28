
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";

interface KYCRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  kycName: string;
}

export const KYCRejectionModal = ({ isOpen, onClose, onReject, kycName }: KYCRejectionModalProps) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim());
      setRejectionReason("");
      onClose();
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Reject KYC Verification</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to reject the KYC verification for <strong>{kycName}</strong>. 
            Please provide a reason for the rejection.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please explain why this KYC verification is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject KYC
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
