-- AlterTable: add nullable magic-link login token
ALTER TABLE "Restaurant" ADD COLUMN "loginToken" TEXT;

-- CreateIndex: enforce uniqueness of the token
CREATE UNIQUE INDEX "Restaurant_loginToken_key" ON "Restaurant"("loginToken");
