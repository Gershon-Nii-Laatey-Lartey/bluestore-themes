-- Add settings column to vendor_profiles table for storefront customizations
ALTER TABLE vendor_profiles 
ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;