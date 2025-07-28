
-- Add package column to product_submissions table
ALTER TABLE product_submissions 
ADD COLUMN package jsonb;
