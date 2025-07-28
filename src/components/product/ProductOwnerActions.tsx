
import { Button } from "@/components/ui/button";
import { Edit, Archive, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { ProductSubmission } from "@/types/product";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductOwnerActionsProps {
  product: ProductSubmission;
  onEdit: () => void;
  onClose: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export const ProductOwnerActions = ({ 
  product, 
  onEdit, 
  onClose, 
  onReactivate, 
  onDelete 
}: ProductOwnerActionsProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Manage Your Ad</h3>
      <div className="flex flex-wrap gap-2">
        {/* Edit button - available for approved, pending, and rejected ads */}
        {(product.status === 'approved' || product.status === 'pending' || product.status === 'rejected') && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}

        {/* Close button - only for approved ads */}
        {product.status === 'approved' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Close Ad
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close this ad?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the ad from public view but keep it in your ads list. You can reactivate it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClose}>
                  Close Ad
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Reactivate button - only for closed ads */}
        {product.status === 'closed' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reactivate
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reactivate this ad?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make your ad visible to the public again and mark it as approved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onReactivate}>
                  Reactivate Ad
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete button - available for all statuses */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete this ad permanently?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your ad and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
