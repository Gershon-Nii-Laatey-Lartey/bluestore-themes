
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Facebook, MessageCircle, Mail } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productUrl: string;
}

export const ShareModal = ({ isOpen, onClose, productTitle, productUrl }: ShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out this product: ${productTitle} - ${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(productUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${productTitle}`);
    const body = encodeURIComponent(`I found this interesting product: ${productTitle}\n\n${productUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={productUrl} readOnly className="flex-1" />
            <Button size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaWhatsApp} className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
            <Button variant="outline" onClick={shareViaFacebook} className="flex items-center space-x-2">
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </Button>
            <Button variant="outline" onClick={shareViaEmail} className="flex items-center space-x-2 col-span-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
