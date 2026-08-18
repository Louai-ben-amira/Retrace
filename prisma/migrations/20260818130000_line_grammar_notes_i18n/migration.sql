-- Replace the single-language `grammarNote` with a locale-keyed `grammarNotes` map.
--
-- Written by hand rather than generated: `prisma migrate diff` renders this as a bare
-- DROP COLUMN + ADD COLUMN, which would discard the explanations already cached on
-- existing lines. The old column only ever held Arabic (the reader served the same note
-- to every user regardless of their language), so its contents move under the "ar" key.

ALTER TABLE "Line" ADD COLUMN "grammarNotes" JSONB NOT NULL DEFAULT '{}';

UPDATE "Line"
   SET "grammarNotes" = jsonb_build_object('ar', "grammarNote")
 WHERE "grammarNote" IS NOT NULL
   AND btrim("grammarNote") <> '';

ALTER TABLE "Line" DROP COLUMN "grammarNote";
