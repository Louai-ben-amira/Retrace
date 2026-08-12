-- ============================================================================
-- Vocabulary multilingual support
--
-- Extends the multilingual-translations work to the vocabulary systems:
--   - VocabGroupWord.translation (String) -> translations (Json), same
--     shape as Line.translations, so admin-curated vocab groups can carry
--     a word's meaning in every supported language.
--   - WordBankEntry / VocabWord (per-user auto-collected words) get a
--     `locale` column recording which language their single `translation`
--     string is actually written in — these rows are per-user snapshots
--     copied from Line.vocabTags at the moment a word is collected, so
--     they don't need full JSON translations, just a language tag so the
--     UI can render dir/font correctly. All existing rows are Arabic, and
--     the column default ('ar') already matches them, so no backfill UPDATE
--     is needed for these two tables.
--   - Line.vocabTags (Json array) is reshaped in place: each tag's flat
--     `translation` string becomes a `translations: { "ar": "..." }`
--     object, mirroring Line.translations, so the AI-tagged vocabulary
--     shown while reading can also be translated into every language.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- VocabGroupWord.translation (String) -> translations (Json)
-- ---------------------------------------------------------------------------
ALTER TABLE "VocabGroupWord" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

UPDATE "VocabGroupWord"
SET "translations" = jsonb_build_object('ar', "translation")
WHERE "translation" IS NOT NULL AND "translation" <> '';

ALTER TABLE "VocabGroupWord" DROP COLUMN "translation";

-- ---------------------------------------------------------------------------
-- WordBankEntry / VocabWord: language tag for the existing single translation
-- ---------------------------------------------------------------------------
ALTER TABLE "WordBankEntry" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'ar';
ALTER TABLE "VocabWord" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'ar';

-- ---------------------------------------------------------------------------
-- Line.vocabTags: reshape each tag's flat `translation` into `translations`
-- ---------------------------------------------------------------------------
UPDATE "Line"
SET "vocabTags" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'word', elem->>'word',
      'translations', jsonb_build_object('ar', elem->>'translation'),
      'example', elem->>'example',
      'difficulty', elem->>'difficulty',
      'frequencyRank', elem->>'frequencyRank'
    )
  )
  FROM jsonb_array_elements("vocabTags") AS elem
)
WHERE "vocabTags" IS NOT NULL AND jsonb_typeof("vocabTags") = 'array';
