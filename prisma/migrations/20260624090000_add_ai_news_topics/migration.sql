CREATE TABLE "news_topics" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'active',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "intro" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "search_query" TEXT NOT NULL,
  "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "why_it_matters" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "action_links" JSONB NOT NULL DEFAULT '[]',
  "faqs" JSONB NOT NULL DEFAULT '[]',
  "source_links" JSONB NOT NULL DEFAULT '[]',
  "english_title" TEXT,
  "english_description" TEXT,
  "english_intro" TEXT,
  "english_answer" TEXT,
  "english_search_query" TEXT,
  "english_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "english_why_it_matters" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "english_action_links" JSONB NOT NULL DEFAULT '[]',
  "english_faqs" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "news_topics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "news_topics_slug_key" ON "news_topics"("slug");

CREATE INDEX "news_topics_status_sort_order_idx"
  ON "news_topics"("status", "sort_order");
