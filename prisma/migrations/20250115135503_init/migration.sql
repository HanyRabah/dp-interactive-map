-- CreateTable
CREATE TABLE "ProjectDetails" (
    "id" TEXT NOT NULL,
    "location" TEXT,
    "image" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPolygon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "popupDetailsId" TEXT,
    "minZoom" INTEGER,
    "maxZoom" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "ProjectPolygon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "hideMarker" BOOLEAN NOT NULL DEFAULT false,
    "zoom" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupDetails" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "image" TEXT,
    "description" TEXT,
    "link" TEXT,
    "imagesLink" TEXT,
    "videoLink" TEXT,
    "ariealLink" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "PopupDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolygonStyle" (
    "id" TEXT NOT NULL,
    "fillColor" TEXT,
    "hoverFillColor" TEXT,
    "fillOpacity" DOUBLE PRECISION,
    "hoverFillOpacity" DOUBLE PRECISION,
    "lineColor" TEXT,
    "lineWidth" INTEGER DEFAULT 1,
    "lineOpacity" DOUBLE PRECISION DEFAULT 1,
    "lineDashArray" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "polygonId" TEXT NOT NULL,

    CONSTRAINT "PolygonStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POI" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POIType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POIType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDetails_projectId_key" ON "ProjectDetails"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPolygon_projectId_key" ON "ProjectPolygon"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPolygon_projectId_idx" ON "ProjectPolygon"("projectId");

-- CreateIndex
CREATE INDEX "Project_lat_lng_idx" ON "Project"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "PolygonStyle_polygonId_key" ON "PolygonStyle"("polygonId");

-- CreateIndex
CREATE INDEX "POI_lat_lng_idx" ON "POI"("lat", "lng");

-- CreateIndex
CREATE INDEX "POI_typeId_idx" ON "POI"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "POIType_name_key" ON "POIType"("name");

-- AddForeignKey
ALTER TABLE "ProjectDetails" ADD CONSTRAINT "ProjectDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPolygon" ADD CONSTRAINT "ProjectPolygon_popupDetailsId_fkey" FOREIGN KEY ("popupDetailsId") REFERENCES "PopupDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPolygon" ADD CONSTRAINT "ProjectPolygon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolygonStyle" ADD CONSTRAINT "PolygonStyle_polygonId_fkey" FOREIGN KEY ("polygonId") REFERENCES "ProjectPolygon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POI" ADD CONSTRAINT "POI_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "POIType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
