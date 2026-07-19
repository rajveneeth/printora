ALTER TABLE "Cart"
ADD COLUMN "expiresAt" TIMESTAMP(3);

ALTER TABLE "CartItem"
ADD COLUMN "lineKey" TEXT;

UPDATE "CartItem"
SET "lineKey" = encode(
  sha256(
    convert_to(
      "productId" || ':' || COALESCE("variantId", 'base') || ':' || BTRIM(COALESCE("customisation", '')),
      'UTF8'
    )
  ),
  'hex'
);

ALTER TABLE "CartItem"
ALTER COLUMN "lineKey" SET NOT NULL;

DROP INDEX IF EXISTS "CartItem_cartId_productId_variantId_key";

UPDATE "Cart"
SET "sessionId" = NULL
WHERE "sessionId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Session" WHERE "Session"."id" = "Cart"."sessionId"
  );

CREATE TABLE "CartMerge" (
  "id" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "sessionId" TEXT,
  "guestCartId" TEXT NOT NULL,
  "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CartMerge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

WITH ranked_carts AS (
  SELECT
    "id",
    "userId",
    FIRST_VALUE("id") OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id"
    ) AS "canonicalId"
  FROM "Cart"
  WHERE "userId" IS NOT NULL
), ranked_items AS (
  SELECT
    item."id",
    ranked_carts."canonicalId",
    ROW_NUMBER() OVER (
      PARTITION BY ranked_carts."userId", item."lineKey"
      ORDER BY item."createdAt", item."id"
    ) AS "rank",
    LEAST(
      10000,
      SUM(item."quantity") OVER (
        PARTITION BY ranked_carts."userId", item."lineKey"
      )
    )::INTEGER AS "mergedQuantity"
  FROM "CartItem" AS item
  JOIN ranked_carts ON ranked_carts."id" = item."cartId"
)
UPDATE "CartItem" AS item
SET
  "cartId" = ranked_items."canonicalId",
  "quantity" = ranked_items."mergedQuantity"
FROM ranked_items
WHERE item."id" = ranked_items."id"
  AND ranked_items."rank" = 1;

WITH ranked_carts AS (
  SELECT
    "id",
    "userId",
    FIRST_VALUE("id") OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id"
    ) AS "canonicalId"
  FROM "Cart"
  WHERE "userId" IS NOT NULL
), ranked_items AS (
  SELECT
    item."id",
    ROW_NUMBER() OVER (
      PARTITION BY ranked_carts."userId", item."lineKey"
      ORDER BY item."createdAt", item."id"
    ) AS "rank"
  FROM "CartItem" AS item
  JOIN ranked_carts ON ranked_carts."id" = item."cartId"
)
DELETE FROM "CartItem"
WHERE "id" IN (SELECT "id" FROM ranked_items WHERE "rank" > 1);

WITH ranked_carts AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id"
    ) AS "rank"
  FROM "Cart"
  WHERE "userId" IS NOT NULL
)
DELETE FROM "Cart"
WHERE "id" IN (SELECT "id" FROM ranked_carts WHERE "rank" > 1);

CREATE UNIQUE INDEX "CartItem_cartId_lineKey_key" ON "CartItem"("cartId", "lineKey");
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");
CREATE INDEX "Cart_expiresAt_idx" ON "Cart"("expiresAt");
CREATE UNIQUE INDEX "CartMerge_cartId_guestCartId_key" ON "CartMerge"("cartId", "guestCartId");
CREATE INDEX "CartMerge_sessionId_mergedAt_idx" ON "CartMerge"("sessionId", "mergedAt");
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

ALTER TABLE "Cart"
ADD CONSTRAINT "Cart_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CartMerge"
ADD CONSTRAINT "CartMerge_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CartMerge"
ADD CONSTRAINT "CartMerge_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
