ALTER TABLE "Session"
ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE INDEX "Session_userId_createdAt_idx" ON "Session"("userId", "createdAt");
CREATE INDEX "Session_expiresAt_revokedAt_idx" ON "Session"("expiresAt", "revokedAt");

ALTER TABLE "CheckoutSession"
ADD COLUMN "sessionId" TEXT;

CREATE INDEX "CheckoutSession_sessionId_createdAt_idx"
ON "CheckoutSession"("sessionId", "createdAt");

ALTER TABLE "CheckoutSession"
ADD CONSTRAINT "CheckoutSession_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
