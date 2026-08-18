-- Migrate billing provider from Stripe to Paddle.
--
-- Written by hand rather than generated: `prisma migrate dev` renders a column rename as
-- DROP COLUMN + ADD COLUMN, which would discard every existing customer/subscription id.
-- RENAME COLUMN preserves the rows, and Postgres carries the unique indexes along with
-- the column, so the indexes only need their names brought in line afterwards.
--
-- NOTE: the values kept by this migration are Stripe ids (cus_… / sub_… / price_…), not
-- Paddle ids (ctm_… / sub_… / pri_…). They are retained so no row is lost and so historic
-- accounts stay traceable; each user is relinked to a real Paddle customer the first time
-- they open checkout or an admin grants them Pro.

ALTER TABLE "Subscription" RENAME COLUMN "stripeCustomerId" TO "paddleCustomerId";
ALTER TABLE "Subscription" RENAME COLUMN "stripeSubscriptionId" TO "paddleSubscriptionId";
ALTER TABLE "Subscription" RENAME COLUMN "stripePriceId" TO "paddlePriceId";

ALTER INDEX "Subscription_stripeCustomerId_key" RENAME TO "Subscription_paddleCustomerId_key";
ALTER INDEX "Subscription_stripeSubscriptionId_key" RENAME TO "Subscription_paddleSubscriptionId_key";
