-- CreateTable
CREATE TABLE "POI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "typeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "POI_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "POIType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "POIType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "POI_lat_lng_idx" ON "POI"("lat", "lng");

-- CreateIndex
CREATE INDEX "POI_typeId_idx" ON "POI"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "POIType_name_key" ON "POIType"("name");
