-- First create the Client table
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- Create a default client for existing projects
INSERT INTO "Client" ("id", "name", "slug", "updatedAt") 
VALUES ('default-client', 'Default Client', 'default-client', CURRENT_TIMESTAMP);

-- Add the clientId column, initially allowing NULL
ALTER TABLE "Project" ADD COLUMN "clientId" TEXT;

-- Add isVisible column with default true
ALTER TABLE "Project" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- Update existing projects to use the default client
UPDATE "Project" SET "clientId" = 'default-client' WHERE "clientId" IS NULL;

-- Now make clientId NOT NULL
ALTER TABLE "Project" ALTER COLUMN "clientId" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" 
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");
CREATE INDEX "Client_slug_idx" ON "Client"("slug");
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");