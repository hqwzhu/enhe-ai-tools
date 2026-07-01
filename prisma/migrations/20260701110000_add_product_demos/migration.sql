CREATE TYPE "ProductDemoStatus" AS ENUM ('draft', 'published', 'archived');

CREATE TYPE "ProductDemoCategory" AS ENUM ('software', 'skill_learning', 'account_service');

CREATE TABLE "product_demos" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "ProductDemoCategory" NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "cover_image" TEXT NOT NULL,
  "cover_alt" TEXT NOT NULL,
  "video_url" TEXT,
  "video_duration" TEXT,
  "upload_date" TIMESTAMP(3),
  "transcript" TEXT,
  "faq" JSONB NOT NULL DEFAULT '[]',
  "product_type" TEXT,
  "related_product_id" TEXT,
  "related_product_slug" TEXT,
  "related_product_url" TEXT,
  "demo_url" TEXT,
  "tutorial_url" TEXT,
  "is_featured_on_home" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductDemoStatus" NOT NULL DEFAULT 'draft',
  "seo_title" TEXT,
  "seo_description" TEXT,
  "canonical_url" TEXT,
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_demos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_demos_slug_key" ON "product_demos"("slug");
CREATE INDEX "product_demos_status_is_featured_on_home_sort_order_idx" ON "product_demos"("status", "is_featured_on_home", "sort_order");
CREATE INDEX "product_demos_category_status_sort_order_idx" ON "product_demos"("category", "status", "sort_order");
CREATE INDEX "product_demos_related_product_id_idx" ON "product_demos"("related_product_id");

ALTER TABLE "product_demos"
  ADD CONSTRAINT "product_demos_related_product_id_fkey"
  FOREIGN KEY ("related_product_id") REFERENCES "tools"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
