-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "currentOwnerUserId" TEXT,
    "currentVersionId" TEXT,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Card_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "CardVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Card_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "nfcTagUid" TEXT,
    "nfcUrl" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "CardVersion_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OwnershipHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "txHash" TEXT,
    "notes" TEXT,
    CONSTRAINT "OwnershipHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_currentVersionId_key" ON "Card"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
