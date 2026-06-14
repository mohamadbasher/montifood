-- AlterTable: add comma-separated cities to a region/area
ALTER TABLE "Region" ADD COLUMN "cities" TEXT NOT NULL DEFAULT '';
