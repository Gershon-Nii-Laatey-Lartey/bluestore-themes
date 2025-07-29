import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ArrowRight, Save, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { dataService } from "@/services/dataService";
import { imageService } from "@/services/imageService";
import { paymentService } from "@/services/paymentService";
import { packageService } from "@/services/packageService";
import { notificationService } from "@/services/notificationService";
import { promoCodeService } from "@/services/promoCodeService";
import { adPackages } from "@/types/adPackage";
import { BasicInformationForm } from "@/components/publish-ad/BasicInformationForm";
import { PricingForm } from "@/components/publish-ad/PricingForm";
import { ImageUploadForm } from "@/components/publish-ad/ImageUploadForm";
import { ContactInformationForm } from "@/components/publish-ad/ContactInformationForm";
import { PackageSelection } from "@/components/publish-ad/PackageSelection";
import { PublishAdProgress } from "@/components/publish-ad/PublishAdProgress";
import { supabase } from "@/integrations/supabase/client";

const PublishAd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    price: '',
    originalPrice: '',
    negotiable: false,
    phone: '',
    location: '',
    specificLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string>('free');
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [freeAdsCount, setFreeAdsCount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoCodeValidation, setPromoCodeValidation] = useState<any>(null);

  // Form persistence - save form data to localStorage
  const saveFormData = () => {
    const dataToSave = {
      formData,
      images: images.map(img => ({ name: img.name, size: img.size, type: img.type })),
      mainImageIndex,
      selectedPackage,
      currentStep,
      promoCode,
      appliedPromoCode
    };
    localStorage.setItem('publishAdFormData', JSON.stringify(dataToSave));
  };

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('publishAdFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setMainImageIndex(parsed.mainImageIndex || 0);
        setSelectedPackage(parsed.selectedPackage || 'free');
        setCurrentStep(parsed.currentStep || 1);
        setPromoCode(parsed.promoCode || "");
        setAppliedPromoCode(parsed.appliedPromoCode || null);
        console.log('Restored form data from localStorage');
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    saveFormData();
  }, [formData, images, mainImageIndex, selectedPackage, currentStep, promoCode, appliedPromoCode]);

  // Handle payment success callback
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');
    
    if (paymentStatus === 'success' && reference) {
      handlePaymentSuccess(reference);
    }
  }, [searchParams]);

  // Check for active subscription
  useEffect(() => {
    const checkActiveSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: subscriptions } = await supabase
          .from('user_plan_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        setHasActiveSubscription(!!subscriptions);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkActiveSubscription();
  }, []);

  // Load vendor profile and free ads count
  useEffect(() => {
    const loadVendorProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load vendor profile
        const { data: profile } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setVendorProfile(profile);

        // Load free ads count
        const { data: freeAds } = await supabase
          .from('product_submissions')
          .select('id')
          .eq('user_id', user.id)
          .or('package->>id.eq.free,package.is.null')
          .eq('status', 'approved');

        setFreeAdsCount(freeAds?.length || 0);
      } catch (error) {
        console.error('Error loading vendor profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadVendorProfile();
  }, []);

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const { data, error } = await paymentService.verifyPayment(reference);
      if (error) throw error;

      if (data.status) {
        toast({
          title: "Payment Successful!",
          description: "Your ad will now be published.",
        });
        navigate('/my-ads');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if your payment was successful.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLocationChange = (location: string) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (mainImageIndex >= index && mainImageIndex > 0) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleSaveAsDraft = async () => {
    if (savingDraft) return;

    try {
      setSavingDraft(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const productId = await dataService.createProductSubmission({
        user_id: user.id,
        title: formData.title || 'Draft',
        description: formData.description || '',
        category: formData.category || 'other',
        condition: formData.condition || 'new',
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price) || 0,
        images: [],
        location: formData.location || '',
        phone: formData.phone || '',
        negotiable: formData.negotiable || false,
        status: 'draft' as const,
        package: null,
        main_image_index: mainImageIndex
      });

      // Upload images if any
      if (images.length > 0) {
        const imageUrls = await imageService.uploadImages(images, productId);
        await dataService.updateProductSubmission(productId, {
          images: imageUrls
        });
      }

      toast({
        title: "Draft Saved!",
        description: "Your draft has been saved successfully.",
      });

      // Clear form data
      localStorage.removeItem('publishAdFormData');
      setFormData({
        title: '',
        category: '',
        condition: '',
        description: '',
        price: '',
        originalPrice: '',
        negotiable: false,
        phone: '',
        location: '',
        specificLocation: ''
      });
      setImages([]);
      setMainImageIndex(0);
      setCurrentStep(1);
      setPromoCode("");
      setAppliedPromoCode(null);

    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setSavingDraft(false);
    }
  };

  // Promo code validation
  const handleValidatePromoCode = async () => {
    if (!promoCode.trim() || !user) return;

    setIsValidatingPromoCode(true);
    try {
      const result = await promoCodeService.validatePromoCode(promoCode.trim(), user.id);
      setPromoCodeValidation(result);

      if (result.is_valid) {
        setAppliedPromoCode(promoCode.trim());
        toast({
          title: "Promo Code Applied!",
          description: "100% discount applied - you can skip package selection!",
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to validate promo code",
        variant: "destructive"
      });
    } finally {
      setIsValidatingPromoCode(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setPromoCodeValidation(null);
    setAppliedPromoCode(null);
    toast({
      title: "Promo Code Removed",
      description: "You'll need to select a package",
    });
  };

  const handleContinueToPackageSelection = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If promo code is applied (100% discount), skip to package selection and immediately publish
    if (appliedPromoCode) {
      setCurrentStep(2);
      // Automatically select free package and publish
      setTimeout(() => {
        handlePublishNow('free');
      }, 100);
      return;
    }
    
    // Otherwise, go to package selection normally
    setCurrentStep(2);
  };

  const handlePublishNow = (packageId: string) => {
    setSelectedPackage(packageId);
    handleCreateProduct();
  };

  const handleCreateProduct = async () => {
    if (submitting) {
      console.log('Submission already in progress, ignoring submit');
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the selected package from database
      const packages = await packageService.getPackages();
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);

      // Create the location string with specific location if provided
      const fullLocation = formData.specificLocation 
        ? `${formData.location} - ${formData.specificLocation}`
        : formData.location;

      // Create product submission with pending status for admin review (both free and paid)
      const productId = await dataService.createProductSubmission({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        images: [], // Start with empty array
        location: fullLocation,
        phone: formData.phone,
        negotiable: formData.negotiable,
        status: 'pending' as const, // Always set to pending for admin review
        package: selectedPkg,
        main_image_index: mainImageIndex
      });

      // Upload images using the product ID
      const imageUrls = await imageService.uploadImages(images, productId);
      
      // Update the product submission with the uploaded image URLs
      await dataService.updateProductSubmission(productId, {
        images: imageUrls
      });

      // Notify admins about the new ad submission
      try {
        await notificationService.notifyAdminsForAdSubmission(user.id, formData.title);
      } catch (notificationError) {
        console.error('Error notifying admins:', notificationError);
        // Don't fail the submission if notification fails
      }

      // For paid packages, increment the subscription usage AFTER successful product creation
      if (selectedPkg && selectedPkg.price > 0 && !appliedPromoCode) {
        try {
          console.log('Incrementing ads used for paid package:', selectedPkg.id);
          const { error: incrementError } = await supabase.rpc('increment_user_ads_used', {
            user_uuid: user.id
          });
          
          if (incrementError) {
            console.error('Error incrementing ads used:', incrementError);
            toast({
              title: "Warning",
              description: "Ad was created but there was an issue tracking usage. Please contact support if you see billing issues.",
              variant: "destructive",
            });
          } else {
            console.log('Ads usage incremented successfully');
          }
        } catch (incrementErr) {
          console.error('Increment function call failed:', incrementErr);
        }
      }
      
      const packageMessage = selectedPkg?.price === 0 || appliedPromoCode
        ? "Your ad has been submitted and is pending review."
        : "Your paid ad has been submitted and is pending review. This ad has been counted towards your subscription usage.";
      
      toast({
        title: "Success!",
        description: `${packageMessage} You'll be notified once it's approved.`,
      });
      
      // Clear saved form data after successful submission
      localStorage.removeItem('publishAdFormData');
      
      navigate('/my-ads');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (processingPayment) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing your payment...</p>
            <p className="text-gray-600">Please wait while we verify your transaction.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {currentStep === 1 && 'Publish Your Product'}
            {currentStep === 2 && 'Choose Your Package'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentStep === 1 && 'Create a new listing for your product'}
            {currentStep === 2 && 'Select a package to promote your ad effectively'}
          </p>
        </div>

        {currentStep === 1 && (
          <form onSubmit={handleContinueToPackageSelection} className="space-y-6">
            <BasicInformationForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />
            
            <PricingForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />

            <ImageUploadForm
              images={images}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
              getImagePreview={getImagePreview}
              mainImageIndex={mainImageIndex}
              onSetMainImage={handleSetMainImage}
            />

            <ContactInformationForm
              formData={formData}
              onInputChange={handleInputChange}
              onLocationChange={handleLocationChange}
              loadingProfile={loadingProfile}
            />

            {/* Promo Code Field */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <Label htmlFor="promo-code" className="text-sm font-medium">
                  Promo Code (Optional)
                </Label>
              </div>

              {appliedPromoCode ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {appliedPromoCode}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      100% off
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromoCode}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    🎉 You can skip package selection and publish directly!
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleValidatePromoCode()}
                    className="flex-1"
                    disabled={isValidatingPromoCode}
                  />
                  <Button
                    onClick={handleValidatePromoCode}
                    disabled={!promoCode.trim() || isValidatingPromoCode}
                    size="sm"
                  >
                    {isValidatingPromoCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              )}

              {promoCodeValidation && !promoCodeValidation.is_valid && !appliedPromoCode && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <XCircle className="h-4 w-4" />
                  {promoCodeValidation.message}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={submitting || loadingProfile}
              >
                {appliedPromoCode ? (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue to Package Selection <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleSaveAsDraft}
                disabled={savingDraft || loadingProfile}
              >
                {savingDraft ? (
                  <>Saving Draft...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <PackageSelection
              selectedPackage={selectedPackage}
              onSelectPackage={setSelectedPackage}
              onPublishNow={handlePublishNow}
              freeAdsCount={freeAdsCount}
              hasActiveSubscription={hasActiveSubscription}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                disabled={submitting}
              >
                Back to Product Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PublishAd;
