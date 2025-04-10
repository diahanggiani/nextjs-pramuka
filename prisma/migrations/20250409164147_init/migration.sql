-- DropForeignKey
ALTER TABLE "GugusDepan" DROP CONSTRAINT "GugusDepan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Kwaran" DROP CONSTRAINT "Kwaran_userId_fkey";

-- DropForeignKey
ALTER TABLE "Kwarcab" DROP CONSTRAINT "Kwarcab_userId_fkey";

-- AlterTable
ALTER TABLE "GugusDepan" ADD COLUMN     "createdById" TEXT,
ALTER COLUMN "kwaranKode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Kwaran" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Kwarcab" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kwarcab" ADD CONSTRAINT "Kwarcab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kwarcab" ADD CONSTRAINT "Kwarcab_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kwaran" ADD CONSTRAINT "Kwaran_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kwaran" ADD CONSTRAINT "Kwaran_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GugusDepan" ADD CONSTRAINT "GugusDepan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GugusDepan" ADD CONSTRAINT "GugusDepan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
