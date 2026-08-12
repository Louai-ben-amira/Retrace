-- ============================================================================
-- Multilingual translations
--
-- Replaces the single Arabic-only translation fields on Line, Story, and
-- VocabGroup with multi-language JSON columns, and adds language preferences
-- to User. Existing data is backfilled into the "ar" key of each new JSON
-- column before the old columns are dropped, and existing users have their
-- current native-language enum value converted into the new text code and
-- copied into uiLanguage, so nobody's reading experience changes and no one
-- is forced back through onboarding.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Line.translation (String) -> Line.translations (Json)
-- ---------------------------------------------------------------------------
ALTER TABLE "Line" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

UPDATE "Line"
SET "translations" = jsonb_build_object('ar', "translation")
WHERE "translation" IS NOT NULL AND "translation" <> '';

ALTER TABLE "Line" DROP COLUMN "translation";

-- ---------------------------------------------------------------------------
-- Story.titleAr / descriptionAr -> Story.titleTranslations / descriptionTranslations
-- ---------------------------------------------------------------------------
ALTER TABLE "Story" ADD COLUMN "titleTranslations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Story" ADD COLUMN "descriptionTranslations" JSONB NOT NULL DEFAULT '{}';

UPDATE "Story"
SET "titleTranslations" = jsonb_build_object('ar', "titleAr")
WHERE "titleAr" IS NOT NULL AND "titleAr" <> '';

UPDATE "Story"
SET "descriptionTranslations" = jsonb_build_object('ar', "descriptionAr")
WHERE "descriptionAr" IS NOT NULL AND "descriptionAr" <> '';

ALTER TABLE "Story" DROP COLUMN "titleAr";
ALTER TABLE "Story" DROP COLUMN "descriptionAr";

-- ---------------------------------------------------------------------------
-- VocabGroup.nameAr -> VocabGroup.titleTranslations
-- ---------------------------------------------------------------------------
ALTER TABLE "VocabGroup" ADD COLUMN "titleTranslations" JSONB NOT NULL DEFAULT '{}';

UPDATE "VocabGroup"
SET "titleTranslations" = jsonb_build_object('ar', "nameAr")
WHERE "nameAr" IS NOT NULL AND "nameAr" <> '';

ALTER TABLE "VocabGroup" DROP COLUMN "nameAr";

-- ---------------------------------------------------------------------------
-- User language preferences
-- ---------------------------------------------------------------------------
ALTER TABLE "User" ADD COLUMN "uiLanguage" TEXT NOT NULL DEFAULT 'ar';
ALTER TABLE "User" ADD COLUMN "targetLanguage" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN "onboarded" BOOLEAN NOT NULL DEFAULT false;

-- Convert the old nativeLanguage enum into the new text code, mirror it into
-- uiLanguage (the app language previously always matched native language),
-- and mark existing users as already onboarded.
ALTER TABLE "User" ADD COLUMN "nativeLanguageNew" TEXT NOT NULL DEFAULT 'ar';

UPDATE "User"
SET
  "nativeLanguageNew" = CASE "nativeLanguage"
    WHEN 'ARABIC'  THEN 'ar'
    WHEN 'FRENCH'  THEN 'fr'
    WHEN 'SPANISH' THEN 'es'
    WHEN 'TURKISH' THEN 'tr'
    ELSE 'ar'
  END,
  "uiLanguage" = CASE "nativeLanguage"
    WHEN 'ARABIC'  THEN 'ar'
    WHEN 'FRENCH'  THEN 'fr'
    WHEN 'SPANISH' THEN 'es'
    WHEN 'TURKISH' THEN 'tr'
    ELSE 'ar'
  END,
  "onboarded" = true;

ALTER TABLE "User" DROP COLUMN "nativeLanguage";
ALTER TABLE "User" RENAME COLUMN "nativeLanguageNew" TO "nativeLanguage";

-- ---------------------------------------------------------------------------
-- Drop the now-unused Language enum
-- ---------------------------------------------------------------------------
DROP TYPE "Language";
