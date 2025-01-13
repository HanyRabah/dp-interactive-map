-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "description" TEXT,
    "hideMarker" BOOLEAN NOT NULL DEFAULT false,
    "zoom" INTEGER NOT NULL DEFAULT 12,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT,
    "image" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectPolygon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "minZoom" INTEGER,
    "maxZoom" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectPolygon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolygonStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fillColor" TEXT,
    "hoverFillColor" TEXT,
    "fillOpacity" REAL,
    "hoverFillOpacity" REAL,
    "lineColor" TEXT,
    "lineWidth" INTEGER DEFAULT 1,
    "lineOpacity" REAL DEFAULT 1,
    "lineDashArray" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "polygonId" TEXT NOT NULL,
    CONSTRAINT "PolygonStyle_polygonId_fkey" FOREIGN KEY ("polygonId") REFERENCES "ProjectPolygon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Project_lat_lng_idx" ON "Project"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDetails_projectId_key" ON "ProjectDetails"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPolygon_projectId_idx" ON "ProjectPolygon"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PolygonStyle_polygonId_key" ON "PolygonStyle"("polygonId");
