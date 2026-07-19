ALTER TABLE "Product" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductVariant" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "SellerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "originCity" TEXT NOT NULL,
    "originState" TEXT NOT NULL,
    "originPostalCode" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "supportedMaterials" TEXT[],
    "printTechnologies" TEXT[],
    "maxPrintDimensions" TEXT,
    "customOrdersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "averageProcessDays" INTEGER NOT NULL DEFAULT 5,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "SellerVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "changeRequestNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductApprovalEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "previousStatus" "ProductStatus",
    "newStatus" "ProductStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductApprovalEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SellerApplication_userId_key" ON "SellerApplication"("userId");
CREATE INDEX "SellerApplication_status_submittedAt_idx" ON "SellerApplication"("status", "submittedAt");
CREATE INDEX "ProductApprovalEvent_productId_createdAt_idx" ON "ProductApprovalEvent"("productId", "createdAt");
CREATE INDEX "Product_sellerId_updatedAt_idx" ON "Product"("sellerId", "updatedAt");
CREATE INDEX "OrderItem_sellerId_idx" ON "OrderItem"("sellerId");

ALTER TABLE "SellerApplication" ADD CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductApprovalEvent" ADD CONSTRAINT "ProductApprovalEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
