ALTER TABLE "Category"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "icon" TEXT,
ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "seoDescription" TEXT;

ALTER TABLE "OrderStatusEvent"
ADD COLUMN "sellerId" TEXT,
ADD COLUMN "actorId" TEXT,
ADD COLUMN "previousStatus" "OrderStatus";

CREATE TABLE "SellerOrderFulfilment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "trackingNumber" TEXT,
  "carrier" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SellerOrderFulfilment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerReview" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "communicationRating" INTEGER NOT NULL,
  "dispatchSpeedRating" INTEGER NOT NULL,
  "customisationRating" INTEGER NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SellerReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewModerationEvent" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT,
  "sellerReviewId" TEXT,
  "moderatorId" TEXT NOT NULL,
  "previousStatus" "ReviewStatus" NOT NULL,
  "newStatus" "ReviewStatus" NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewModerationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerModerationEvent" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "moderatorId" TEXT NOT NULL,
  "previousStatus" "SellerVerificationStatus" NOT NULL,
  "newStatus" "SellerVerificationStatus" NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SellerModerationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "previousState" JSONB,
  "newState" JSONB,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");
CREATE INDEX "Review_productId_status_createdAt_idx" ON "Review"("productId", "status", "createdAt");
CREATE UNIQUE INDEX "SellerOrderFulfilment_orderId_sellerId_key" ON "SellerOrderFulfilment"("orderId", "sellerId");
CREATE INDEX "SellerOrderFulfilment_sellerId_status_updatedAt_idx" ON "SellerOrderFulfilment"("sellerId", "status", "updatedAt");
CREATE UNIQUE INDEX "SellerReview_orderItemId_key" ON "SellerReview"("orderItemId");
CREATE INDEX "SellerReview_sellerId_status_createdAt_idx" ON "SellerReview"("sellerId", "status", "createdAt");
CREATE INDEX "ReviewModerationEvent_reviewId_createdAt_idx" ON "ReviewModerationEvent"("reviewId", "createdAt");
CREATE INDEX "ReviewModerationEvent_sellerReviewId_createdAt_idx" ON "ReviewModerationEvent"("sellerReviewId", "createdAt");
CREATE INDEX "SellerModerationEvent_sellerId_createdAt_idx" ON "SellerModerationEvent"("sellerId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerOrderFulfilment" ADD CONSTRAINT "SellerOrderFulfilment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerOrderFulfilment" ADD CONSTRAINT "SellerOrderFulfilment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReviewModerationEvent" ADD CONSTRAINT "ReviewModerationEvent_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewModerationEvent" ADD CONSTRAINT "ReviewModerationEvent_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES "SellerReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerModerationEvent" ADD CONSTRAINT "SellerModerationEvent_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "SellerOrderFulfilment" ("id", "orderId", "sellerId", "status", "createdAt", "updatedAt")
SELECT
  'fulfilment_' || md5("OrderItem"."orderId" || ':' || "OrderItem"."sellerId"),
  "OrderItem"."orderId",
  "OrderItem"."sellerId",
  "Order"."status",
  "Order"."placedAt",
  CURRENT_TIMESTAMP
FROM "OrderItem"
INNER JOIN "Order" ON "Order"."id" = "OrderItem"."orderId"
GROUP BY "OrderItem"."orderId", "OrderItem"."sellerId", "Order"."status", "Order"."placedAt"
ON CONFLICT ("orderId", "sellerId") DO NOTHING;
