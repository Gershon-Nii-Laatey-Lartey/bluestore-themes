import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield } from "lucide-react";
import { DocumentImage } from "./DocumentImage";
import { ImageViewModal } from "./ImageViewModal";
import { KYCRejectionModal } from "./KYCRejectionModal";
import { useState } from "react";

interface KYCDetailModalProps {
  kyc: any;
  onApproval: (kycId: string, approved: boolean, rejectionReason?: string) => void;
}

export const KYCDetailModal = ({ kyc, onApproval }: KYCDetailModalProps) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const handleImageClick = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
  };

  const handleApprove = () => {
    onApproval(kyc.id, true);
  };

  const handleReject = (rejectionReason: string) => {
    onApproval(kyc.id, false, rejectionReason);
  };

  return (
    <>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>KYC Verification Details - {kyc.full_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium">{kyc.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{kyc.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{kyc.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right">{kyc.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{kyc.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Store Name:</span>
                  <span className="font-medium">{kyc.store_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-medium text-right">{kyc.product_category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="font-medium mt-1">{kyc.store_description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* ID Document Front */}
                {kyc.id_document_url && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">ID Document (Front)</h4>
                    <div 
                      className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(kyc.id_document_url, "ID Document Front")}
                    >
                      <DocumentImage 
                        src={kyc.id_document_url} 
                        alt="ID Document Front" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}

                {/* ID Document Back */}
                {kyc.id_document_back_url && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">ID Document (Back)</h4>
                    <div 
                      className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(kyc.id_document_back_url, "ID Document Back")}
                    >
                      <DocumentImage 
                        src={kyc.id_document_back_url} 
                        alt="ID Document Back" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}

                {/* Selfie with ID */}
                {kyc.selfie_with_id_url && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selfie with ID</h4>
                    <div 
                      className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(kyc.selfie_with_id_url, "Selfie with ID")}
                    >
                      <DocumentImage 
                        src={kyc.selfie_with_id_url} 
                        alt="Selfie with ID" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">{new Date(kyc.submitted_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={
                  kyc.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : kyc.status === 'rejected' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }>
                  {kyc.status}
                </Badge>
              </div>
              {kyc.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviewed:</span>
                  <span className="font-medium">{new Date(kyc.reviewed_at).toLocaleString()}</span>
                </div>
              )}
              {kyc.rejection_reason && (
                <div>
                  <span className="text-gray-600">Rejection Reason:</span>
                  <p className="font-medium mt-1 text-red-600">{kyc.rejection_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleApprove} 
              disabled={kyc.status !== 'pending'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowRejectionModal(true)} 
              disabled={kyc.status !== 'pending'}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        {/* Image View Modal */}
        <ImageViewModal 
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage?.src || ''}
          imageAlt={selectedImage?.alt || ''}
        />
      </DialogContent>

      {/* KYC Rejection Modal */}
      <KYCRejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onReject={handleReject}
        kycName={kyc.full_name}
      />
    </>
  );
};
