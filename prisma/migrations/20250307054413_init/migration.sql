-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'MOVER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SEOUL', 'BUSAN', 'DAEGU', 'INCHEON', 'GWANGJU', 'DAEJEON', 'ULSAN', 'SEJONG', 'GYEONGGI', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'JEONBUK', 'JEONNAM', 'GYEONGBUK', 'GYEONGNAM', 'JEJU');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('DEPARTURE', 'ARRIVAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLogin" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL,
    "location" "Region" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerService" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mover" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL,
    "experience_years" INTEGER NOT NULL,
    "introduction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_customer_favorite" INTEGER NOT NULL DEFAULT 0,
    "total_confirmed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerFavorite" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoverService" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoverService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoverServiceRegion" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoverServiceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "move_type" "ServiceType" NOT NULL,
    "from_region" "Region" NOT NULL,
    "to_region" "Region" NOT NULL,
    "move_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequestAddress" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "sido" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,

    CONSTRAINT "QuoteRequestAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteStatusHistory" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetedQuoteRequest" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetedQuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetedQuoteRejection" (
    "id" TEXT NOT NULL,
    "targeted_quote_request_id" TEXT NOT NULL,
    "rejection_reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetedQuoteRejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoverQuote" (
    "id" TEXT NOT NULL,
    "targeted_quote_request_id" TEXT,
    "mover_id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoverQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteMatch" (
    "id" TEXT NOT NULL,
    "mover_quote_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "quote_match_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_type_phone_number_key" ON "User"("user_type", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLogin_user_id_key" ON "SocialLogin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLogin_provider_provider_id_key" ON "SocialLogin"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_user_id_key" ON "Customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_user_id_key" ON "Mover"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerFavorite_customer_id_mover_id_key" ON "CustomerFavorite"("customer_id", "mover_id");

-- CreateIndex
CREATE UNIQUE INDEX "MoverService_mover_id_service_type_key" ON "MoverService"("mover_id", "service_type");

-- CreateIndex
CREATE UNIQUE INDEX "MoverServiceRegion_mover_id_region_key" ON "MoverServiceRegion"("mover_id", "region");

-- CreateIndex
CREATE UNIQUE INDEX "TargetedQuoteRejection_targeted_quote_request_id_key" ON "TargetedQuoteRejection"("targeted_quote_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "MoverQuote_targeted_quote_request_id_key" ON "MoverQuote"("targeted_quote_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteMatch_mover_quote_id_key" ON "QuoteMatch"("mover_quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_quote_match_id_key" ON "Review"("quote_match_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLogin" ADD CONSTRAINT "SocialLogin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerService" ADD CONSTRAINT "CustomerService_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mover" ADD CONSTRAINT "Mover_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoverService" ADD CONSTRAINT "MoverService_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoverServiceRegion" ADD CONSTRAINT "MoverServiceRegion_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestAddress" ADD CONSTRAINT "QuoteRequestAddress_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStatusHistory" ADD CONSTRAINT "QuoteStatusHistory_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetedQuoteRequest" ADD CONSTRAINT "TargetedQuoteRequest_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetedQuoteRequest" ADD CONSTRAINT "TargetedQuoteRequest_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetedQuoteRejection" ADD CONSTRAINT "TargetedQuoteRejection_targeted_quote_request_id_fkey" FOREIGN KEY ("targeted_quote_request_id") REFERENCES "TargetedQuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoverQuote" ADD CONSTRAINT "MoverQuote_targeted_quote_request_id_fkey" FOREIGN KEY ("targeted_quote_request_id") REFERENCES "TargetedQuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoverQuote" ADD CONSTRAINT "MoverQuote_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoverQuote" ADD CONSTRAINT "MoverQuote_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteMatch" ADD CONSTRAINT "QuoteMatch_mover_quote_id_fkey" FOREIGN KEY ("mover_quote_id") REFERENCES "MoverQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_quote_match_id_fkey" FOREIGN KEY ("quote_match_id") REFERENCES "QuoteMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
