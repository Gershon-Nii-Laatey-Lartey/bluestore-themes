
// Re-export the main service and types for backward compatibility
export { kycService } from "./kyc/kycService";
export type { KYCSubmissionData, KYCSubmissionResponse } from "./kyc/types";

// This file now serves as the main entry point for KYC services
// The actual implementation has been refactored into smaller, focused modules:
// - ./kyc/types.ts - Type definitions
// - ./kyc/fileUploadService.ts - File upload handling
// - ./kyc/apiService.ts - Database operations
// - ./kyc/kycService.ts - Main orchestration service
