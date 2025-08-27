-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('user', 'ai', 'system');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_keys" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "apiKeyCipher" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."llm_models" (
    "id" TEXT NOT NULL,
    "providerKeyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "defaultTemperature" DOUBLE PRECISION,
    "defaultTopP" DOUBLE PRECISION,
    "defaultMaxTokens" INTEGER,

    CONSTRAINT "llm_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_providers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "providerKeyId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "provider_master_name_key" ON "public"."provider_master"("name");

-- CreateIndex
CREATE INDEX "provider_keys_providerId_idx" ON "public"."provider_keys"("providerId");

-- CreateIndex
CREATE INDEX "llm_models_providerKeyId_idx" ON "public"."llm_models"("providerKeyId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "public"."sessions"("userId");

-- CreateIndex
CREATE INDEX "session_providers_sessionId_idx" ON "public"."session_providers"("sessionId");

-- CreateIndex
CREATE INDEX "session_providers_providerKeyId_idx" ON "public"."session_providers"("providerKeyId");

-- CreateIndex
CREATE INDEX "session_providers_modelName_idx" ON "public"."session_providers"("modelName");

-- CreateIndex
CREATE INDEX "messages_sessionId_createdAt_idx" ON "public"."messages"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."provider_keys" ADD CONSTRAINT "provider_keys_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."provider_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."llm_models" ADD CONSTRAINT "llm_models_providerKeyId_fkey" FOREIGN KEY ("providerKeyId") REFERENCES "public"."provider_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_providers" ADD CONSTRAINT "session_providers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_providers" ADD CONSTRAINT "session_providers_providerKeyId_fkey" FOREIGN KEY ("providerKeyId") REFERENCES "public"."provider_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
