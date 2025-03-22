/*
  Warnings:

  - Made the column `status` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `plan` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "plan" SET NOT NULL,
ALTER COLUMN "plan" SET DEFAULT 'FREE';
