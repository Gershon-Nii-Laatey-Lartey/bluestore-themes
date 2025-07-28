
interface KYCHeaderProps {
  currentStep: number;
}

export const KYCHeader = ({ currentStep }: KYCHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">KYC Verification</h1>
      <p className="text-gray-600 mt-1">
        Step {currentStep} of 2: {currentStep === 1 ? 'Personal & Store Information' : 'ID Verification & Consent'}
      </p>
    </div>
  );
};
