-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "undanganId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kategori" TEXT,
    "telepon" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_slug_key" ON "Guest"("slug");

-- CreateIndex
CREATE INDEX "Guest_undanganId_idx" ON "Guest"("undanganId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_undanganId_fkey" FOREIGN KEY ("undanganId") REFERENCES "Undangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
