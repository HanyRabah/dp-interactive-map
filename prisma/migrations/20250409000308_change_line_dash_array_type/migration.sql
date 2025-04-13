/*
  Warnings:

  - The `lineDashArray` column on the `PolygonStyle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PolygonStyle" DROP COLUMN "lineDashArray",
ADD COLUMN     "lineDashArray" JSONB;
