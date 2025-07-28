
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DocumentImage } from "./DocumentImage";
import { X, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

export const ImageViewModal = ({ isOpen, onClose, imageSrc, imageAlt }: ImageViewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/90">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center justify-center w-full h-full p-8">
            <div className="relative max-w-full max-h-full">
              <DocumentImage 
                src={imageSrc} 
                alt={imageAlt} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
              />
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                {imageAlt}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
