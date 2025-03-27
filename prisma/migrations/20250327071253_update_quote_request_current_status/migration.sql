-- AlterTable
ALTER TABLE "quote_request" ADD COLUMN     "current_status" TEXT NOT NULL DEFAULT 'QUOTE_REQUESTED';
