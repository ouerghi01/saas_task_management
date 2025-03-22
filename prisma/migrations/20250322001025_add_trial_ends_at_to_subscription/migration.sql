/*
  Warnings:

  - Made the column `trialEndsAt` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "trialEndsAt" SET NOT NULL;
