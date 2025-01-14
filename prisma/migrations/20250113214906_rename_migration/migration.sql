/*
  Warnings:

  - Added the required column `description` to the `ProjectPolygon` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectPolygon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "minZoom" INTEGER,
    "maxZoom" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectPolygon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectPolygon" ("coordinates", "createdAt", "id", "maxZoom", "minZoom", "name", "projectId", "type", "updatedAt") SELECT "coordinates", "createdAt", "id", "maxZoom", "minZoom", "name", "projectId", "type", "updatedAt" FROM "ProjectPolygon";
DROP TABLE "ProjectPolygon";
ALTER TABLE "new_ProjectPolygon" RENAME TO "ProjectPolygon";
CREATE INDEX "ProjectPolygon_projectId_idx" ON "ProjectPolygon"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
