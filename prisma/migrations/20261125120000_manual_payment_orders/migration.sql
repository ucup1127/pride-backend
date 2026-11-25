ALTER TABLE "Order"
ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "publishedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "transferAmount" INTEGER,
ADD COLUMN "transferSenderName" TEXT,
ADD COLUMN "transferReference" TEXT,
ADD COLUMN "transferDate" TIMESTAMP(3),
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedBy" TEXT,
ADD COLUMN "refundAmount" INTEGER,
ADD COLUMN "adminFee" INTEGER,
ADD COLUMN "reviewNote" TEXT;

CREATE INDEX "Order_userId_status_createdAt_idx" ON "Order"("userId", "status", "createdAt");

ALTER TABLE "Undangan"
ADD COLUMN "orderId" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Undangan_orderId_idx" ON "Undangan"("orderId");

ALTER TABLE "Undangan"
ADD CONSTRAINT "Undangan_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
