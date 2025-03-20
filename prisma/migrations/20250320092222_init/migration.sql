-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'MOVER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SEOUL', 'BUSAN', 'DAEGU', 'INCHEON', 'GWANGJU', 'DAEJEON', 'ULSAN', 'SEJONG', 'GYEONGGI', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'JEONBUK', 'JEONNAM', 'GYEONGBUK', 'GYEONGNAM', 'JEJU');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('DEPARTURE', 'ARRIVAL');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_login" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL,
    "location" "Region" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_service" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover" (
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

    CONSTRAINT "mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_favorite" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover_service" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mover_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover_service_region" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mover_service_region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_request" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "move_type" "ServiceType" NOT NULL,
    "from_region" "Region" NOT NULL,
    "to_region" "Region" NOT NULL,
    "move_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_request_address" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "sido" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,

    CONSTRAINT "quote_request_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_status_history" (
    "id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "targeted_quote_request" (
    "id" TEXT NOT NULL,
    "mover_id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "targeted_quote_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "targeted_quote_rejection" (
    "id" TEXT NOT NULL,
    "targeted_quote_request_id" TEXT NOT NULL,
    "rejection_reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "targeted_quote_rejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover_quote" (
    "id" TEXT NOT NULL,
    "targeted_quote_request_id" TEXT,
    "mover_id" TEXT NOT NULL,
    "quote_request_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mover_quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_match" (
    "id" TEXT NOT NULL,
    "mover_quote_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "quote_match_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_user_type_phone_number_key" ON "user"("user_type", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "social_login_user_id_key" ON "social_login"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_login_provider_provider_id_key" ON "social_login"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_id_key" ON "customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mover_user_id_key" ON "mover"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_favorite_customer_id_mover_id_key" ON "customer_favorite"("customer_id", "mover_id");

-- CreateIndex
CREATE UNIQUE INDEX "mover_service_mover_id_service_type_key" ON "mover_service"("mover_id", "service_type");

-- CreateIndex
CREATE UNIQUE INDEX "mover_service_region_mover_id_region_key" ON "mover_service_region"("mover_id", "region");

-- CreateIndex
CREATE UNIQUE INDEX "targeted_quote_rejection_targeted_quote_request_id_key" ON "targeted_quote_rejection"("targeted_quote_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "mover_quote_targeted_quote_request_id_key" ON "mover_quote"("targeted_quote_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "quote_match_mover_quote_id_key" ON "quote_match"("mover_quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_quote_match_id_key" ON "review"("quote_match_id");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_login" ADD CONSTRAINT "social_login_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_service" ADD CONSTRAINT "customer_service_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover" ADD CONSTRAINT "mover_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorite" ADD CONSTRAINT "customer_favorite_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorite" ADD CONSTRAINT "customer_favorite_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_service" ADD CONSTRAINT "mover_service_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_service_region" ADD CONSTRAINT "mover_service_region_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_request" ADD CONSTRAINT "quote_request_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_request_address" ADD CONSTRAINT "quote_request_address_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_status_history" ADD CONSTRAINT "quote_status_history_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targeted_quote_request" ADD CONSTRAINT "targeted_quote_request_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targeted_quote_request" ADD CONSTRAINT "targeted_quote_request_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targeted_quote_rejection" ADD CONSTRAINT "targeted_quote_rejection_targeted_quote_request_id_fkey" FOREIGN KEY ("targeted_quote_request_id") REFERENCES "targeted_quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_quote" ADD CONSTRAINT "mover_quote_targeted_quote_request_id_fkey" FOREIGN KEY ("targeted_quote_request_id") REFERENCES "targeted_quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_quote" ADD CONSTRAINT "mover_quote_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_quote" ADD CONSTRAINT "mover_quote_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_match" ADD CONSTRAINT "quote_match_mover_quote_id_fkey" FOREIGN KEY ("mover_quote_id") REFERENCES "mover_quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_quote_match_id_fkey" FOREIGN KEY ("quote_match_id") REFERENCES "quote_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
