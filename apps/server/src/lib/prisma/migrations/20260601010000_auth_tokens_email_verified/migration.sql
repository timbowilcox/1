-- Email verification flag on users
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- Token type
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- Tokens for email verification + password reset (raw token is hashed)
CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auth_tokens_user_id_idx" ON "auth_tokens"("user_id");
CREATE INDEX "auth_tokens_token_hash_idx" ON "auth_tokens"("token_hash");

ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
