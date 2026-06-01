-- Service-role-only architecture: enable RLS with NO policies so the anon /
-- authenticated PostgREST roles are denied, while the table owner (Prisma) and
-- the service-role key (Supabase Storage) continue to bypass RLS.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "original_project_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "styled_project_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "collection_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "styles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_tokens" ENABLE ROW LEVEL SECURITY;
