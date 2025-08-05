-- Migration to add coupon-related fields to cart table
-- Run this SQL script to update the cart table structure

ALTER TABLE cart 
ADD COLUMN applied_coupon TEXT NULL COMMENT 'JSON string containing applied coupon details',
ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total discount amount applied to the cart',
ADD COLUMN delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Delivery fee for the cart';

-- Update existing carts to have default values
UPDATE cart 
SET discount_amount = 0.00, delivery_fee = 0.00 
WHERE discount_amount IS NULL OR delivery_fee IS NULL;
