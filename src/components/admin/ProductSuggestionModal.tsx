
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import { useState } from "react";

interface ProductSuggestionModalProps {
  productTitle: string;
  onSuggestion: (suggestion: string) => void;
  onSkip: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ProductSuggestionModal = ({ 
  productTitle, 
  onSuggestion, 
  onSkip,
  onCancel, 
  isSubmitting = false 
}: ProductSuggestionModalProps) => {
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = () => {
    if (suggestion.trim()) {
      onSuggestion(suggestion.trim());
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Suggest Improvements
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Product: <span className="font-medium">"{productTitle}"</span>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="suggestion">Suggestions for improvement (optional)</Label>
          <Textarea
            id="suggestion"
            placeholder="Provide helpful suggestions to improve this product listing (e.g., better photos, more detailed description, competitive pricing)..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            These suggestions will help the vendor improve their listing before approval.
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
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Processing..." : "Skip & Approve"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!suggestion.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Sending..." : "Send Suggestions"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
