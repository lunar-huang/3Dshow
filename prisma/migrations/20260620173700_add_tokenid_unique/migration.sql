/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Card_tokenId_key" ON "Card"("tokenId");
