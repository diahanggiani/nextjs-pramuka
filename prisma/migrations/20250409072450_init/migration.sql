/*
  Warnings:

  - A unique constraint covering the columns `[nama_gusdep]` on the table `GugusDepan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama_kwaran]` on the table `Kwaran` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama_kwarcab]` on the table `Kwarcab` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GugusDepan_nama_gusdep_key" ON "GugusDepan"("nama_gusdep");

-- CreateIndex
CREATE UNIQUE INDEX "Kwaran_nama_kwaran_key" ON "Kwaran"("nama_kwaran");

-- CreateIndex
CREATE UNIQUE INDEX "Kwarcab_nama_kwarcab_key" ON "Kwarcab"("nama_kwarcab");
