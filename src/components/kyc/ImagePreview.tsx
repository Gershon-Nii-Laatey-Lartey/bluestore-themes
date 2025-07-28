
import { useState } from "react";
import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  label: string;
}

export const ImagePreview = ({ file, onRemove, label }: ImagePreviewProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handlePreview = () => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl('');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              className="w-10 h-10 object-cover rounded"
              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
            />
          </div>
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-gray-500">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={label}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
