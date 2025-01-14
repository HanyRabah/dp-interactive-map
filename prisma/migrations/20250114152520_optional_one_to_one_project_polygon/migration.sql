-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectPolygon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "popupDetailsId" TEXT,
    "minZoom" INTEGER,
    "maxZoom" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT,
    CONSTRAINT "ProjectPolygon_popupDetailsId_fkey" FOREIGN KEY ("popupDetailsId") REFERENCES "PopupDetails" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectPolygon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectPolygon" ("coordinates", "createdAt", "description", "id", "maxZoom", "minZoom", "name", "popupDetailsId", "projectId", "type", "updatedAt") SELECT "coordinates", "createdAt", "description", "id", "maxZoom", "minZoom", "name", "popupDetailsId", "projectId", "type", "updatedAt" FROM "ProjectPolygon";
DROP TABLE "ProjectPolygon";
ALTER TABLE "new_ProjectPolygon" RENAME TO "ProjectPolygon";
CREATE UNIQUE INDEX "ProjectPolygon_projectId_key" ON "ProjectPolygon"("projectId");
CREATE INDEX "ProjectPolygon_projectId_idx" ON "ProjectPolygon"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
