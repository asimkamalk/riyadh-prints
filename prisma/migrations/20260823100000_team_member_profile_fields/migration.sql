-- AlterTable
ALTER TABLE "TeamMemberTranslation" ADD COLUMN "secondaryRole" TEXT;
ALTER TABLE "TeamMemberTranslation" ADD COLUMN "experience" TEXT;
ALTER TABLE "TeamMemberTranslation" ADD COLUMN "awards" TEXT;
ALTER TABLE "TeamMemberTranslation" ADD COLUMN "skills" JSONB;
