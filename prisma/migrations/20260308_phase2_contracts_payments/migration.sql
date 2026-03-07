-- Phase 2 migration: Add description to Contract, add stripeSessionId to Payment

-- Add description column to Contract table
ALTER TABLE "Contract" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

-- Add stripeSessionId column to Payment table
ALTER TABLE "Payment" ADD COLUMN "stripeSessionId" TEXT;

-- Add unique constraint on stripeSessionId
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_stripeSessionId_key" UNIQUE ("stripeSessionId");
