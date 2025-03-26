-- AlterTable
ALTER TABLE "mover_quote" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "highlight" TEXT[];
