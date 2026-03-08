-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMP(3);
