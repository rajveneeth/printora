ALTER TABLE "Product" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;

CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_basePrice_idx" ON "Product"("basePrice");
CREATE INDEX "Product_searchKeywords_idx" ON "Product" USING GIN ("searchKeywords");
CREATE INDEX "Product_tags_idx" ON "Product" USING GIN ("tags");
