
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { incrementUserAdsUsed } from '@/services/productService';

interface PublishButtonProps {
  formData: any;
  selectedPackage: any;
  isDisabled: boolean;
  isFreeLimitReached?: boolean;
  processingPayment?: boolean;
  onPublishSuccess: () => void;
  onPublish?: () => Promise<void>;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  formData,
  selectedPackage,
  isDisabled,
  isFreeLimitReached = false,
  processingPayment = false,
  onPublishSuccess,
  onPublish
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (onPublish) {
      await onPublish();
      return;
    }

    if (!user || !formData || !selectedPackage) return;

    setIsSubmitting(true);
    try {
      console.log('Publishing ad with data:', { formData, selectedPackage });

      // Create the product submission
      const submissionData = {
        user_id: user.id,
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        negotiable: formData.negotiable || false,
        phone: formData.phone,
        location: formData.location,
        images: formData.images || [],
        main_image_index: formData.mainImageIndex || 0,
        package: selectedPackage,
        package_price: selectedPackage.price || 0,
        status: 'pending'
      };

      const { data: submission, error: submissionError } = await supabase
        .from('product_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (submissionError) {
        console.error('Error creating product submission:', submissionError);
        throw submissionError;
      }

      console.log('Product submission created:', submission);

      // Only increment ads used for paid packages after successful submission
      // The database function will handle finding the right subscription and prevent over-usage
      if (selectedPackage.id !== 'free' && selectedPackage.price > 0) {
        try {
          console.log('Incrementing ads used for paid package:', selectedPackage.id);
          await incrementUserAdsUsed(user.id);
          console.log('Ads usage incremented successfully');
        } catch (incrementError) {
          console.error('Failed to increment ads used:', incrementError);
          // Don't fail the entire operation, but warn the user
          toast({
            title: "Warning",
            description: "Ad was created but there was an issue tracking usage. Please contact support if you see billing issues.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success!",
        description: "Your ad has been submitted for review.",
      });

      onPublishSuccess();
    } catch (error) {
      console.error('Error publishing ad:', error);
      toast({
        title: "Error",
        description: "Failed to publish your ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isDisabled || isSubmitting || processingPayment || isFreeLimitReached;

  return (
    <Button
      onClick={handleSubmit}
      disabled={isButtonDisabled}
      className="w-full"
      size="lg"
    >
      {isSubmitting || processingPayment ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {processingPayment ? 'Processing Payment...' : 'Publishing...'}
        </>
      ) : isFreeLimitReached ? (
        'Free Limit Reached'
      ) : (
        'Publish Ad'
      )}
    </Button>
  );
};
