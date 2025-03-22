/*
  Warnings:

  - Made the column `email` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "company" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");
