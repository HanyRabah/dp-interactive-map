/*
  Warnings:

  - Added the required column `link` to the `PopupDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PopupDetails` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PopupDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_PopupDetails" ("description", "id", "image", "title") SELECT "description", "id", "image", "title" FROM "PopupDetails";
DROP TABLE "PopupDetails";
ALTER TABLE "new_PopupDetails" RENAME TO "PopupDetails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
