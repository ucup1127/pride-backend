-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "undanganId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kehadiran" TEXT NOT NULL,
    "ucapan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_undanganId_fkey" FOREIGN KEY ("undanganId") REFERENCES "Undangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
