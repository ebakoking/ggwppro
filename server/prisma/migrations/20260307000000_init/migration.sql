-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PlayStyle" AS ENUM ('TRYHARD', 'CHILL', 'COMPETITIVE', 'CASUAL', 'TEAM_PLAYER', 'EXPLORER');

-- CreateEnum
CREATE TYPE "GameLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SwipeAction" AS ENUM ('LIKE', 'DISLIKE', 'PENTAKILL');

-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('FPS', 'MOBA', 'RPG', 'BATTLE_ROYALE', 'SANDBOX', 'SPORTS', 'STRATEGY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshToken" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "playStyle" "PlayStyle",
    "gameLevel" "GameLevel",
    "usesMic" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumPlan" TEXT,
    "premiumExpiresAt" TIMESTAMP(3),
    "pentakillsLeft" INTEGER NOT NULL DEFAULT 0,
    "dailyLikesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastLikeResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filterGender" TEXT,
    "filterAgeMin" INTEGER,
    "filterAgeMax" INTEGER,
    "filterMicOnly" BOOLEAN NOT NULL DEFAULT false,
    "filterPlayStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "filterActivity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" "GameCategory" NOT NULL,

    CONSTRAINT "game_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "rank" TEXT,
    "role" TEXT,
    "hoursPlayed" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "action" "SwipeAction" NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "linkUrl" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "forum_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "game_catalog_name_key" ON "game_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "game_catalog_slug_key" ON "game_catalog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_games_userId_gameId_key" ON "user_games"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_fromId_toId_gameId_key" ON "swipes"("fromId", "toId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_userAId_userBId_gameId_key" ON "matches"("userAId", "userBId", "gameId");

-- CreateIndex
CREATE INDEX "messages_matchId_createdAt_idx" ON "messages"("matchId", "createdAt");

-- CreateIndex
CREATE INDEX "forum_posts_gameId_createdAt_idx" ON "forum_posts"("gameId", "createdAt");

-- CreateIndex
CREATE INDEX "forum_comments_postId_createdAt_idx" ON "forum_comments"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "forum_likes_postId_userId_key" ON "forum_likes"("postId", "userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_toId_fkey" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_likes" ADD CONSTRAINT "forum_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_likes" ADD CONSTRAINT "forum_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

