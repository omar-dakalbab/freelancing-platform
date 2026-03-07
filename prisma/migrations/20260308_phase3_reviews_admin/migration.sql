-- Phase 3: Add suspended to User, REMOVED to JobStatus, unique constraint on Review

-- Add suspended field to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspended" BOOLEAN NOT NULL DEFAULT false;

-- Add REMOVED to JobStatus enum
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'REMOVED';

-- Add unique constraint on Review (one review per contract per reviewer)
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_reviewerId_key" UNIQUE ("contractId", "reviewerId");
