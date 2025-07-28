
interface KYCProgressIndicatorProps {
  currentStep: number;
}

export const KYCProgressIndicator = ({ currentStep }: KYCProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          2
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Personal & Store</span>
        <span>ID Verification</span>
      </div>
    </div>
  );
};
