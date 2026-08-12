-- ============================================================================
-- WordBankEntry / VocabWord: live multilingual translations
--
-- Replaces the per-row `translation` (String) + `locale` (String) pair — which
-- froze a personal word-bank entry at whatever language it was collected in —
-- with a `translations` (Json) column, mirroring Line.vocabTags. This lets a
-- user's word bank re-render in whichever native language they're currently
-- using, instead of staying stuck in the language it happened to be captured
-- in. Existing rows are backfilled by keying their single translation under
-- the language recorded in `locale` before both columns are dropped.
-- ============================================================================

ALTER TABLE "WordBankEntry" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

UPDATE "WordBankEntry"
SET "translations" = jsonb_build_object("locale", "translation")
WHERE "translation" IS NOT NULL AND "translation" <> '';

ALTER TABLE "WordBankEntry" DROP COLUMN "translation";
ALTER TABLE "WordBankEntry" DROP COLUMN "locale";

ALTER TABLE "VocabWord" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

UPDATE "VocabWord"
SET "translations" = jsonb_build_object("locale", "translation")
WHERE "translation" IS NOT NULL AND "translation" <> '';

ALTER TABLE "VocabWord" DROP COLUMN "translation";
ALTER TABLE "VocabWord" DROP COLUMN "locale";
