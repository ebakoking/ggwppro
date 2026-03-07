import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) {}

  private getAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }

  private genderMap: Record<string, string> = {
    ERKEK: 'MALE',
    KADIN: 'FEMALE',
    DIGER: 'OTHER',
  };

  async getDiscoverFeed(userId: string, gameId: string | undefined, limit = 10) {
    const myProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const myGames = await this.prisma.userGame.findMany({
      where: { userId },
      select: { gameId: true },
    });
    const myGameIds = myGames.map((g) => g.gameId);

    const alreadySwiped = await this.prisma.swipe.findMany({
      where: { fromId: userId, ...(gameId ? { gameId } : {}) },
      select: { toId: true },
    });
    const swipedIds = alreadySwiped.map((s) => s.toId);

    const candidateUserGames = await this.prisma.userGame.findMany({
      where: {
        ...(gameId ? { gameId } : {}),
        userId: { notIn: [...swipedIds, userId] },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: limit * 4,
    });

    const candidateUserIds = [...new Set(candidateUserGames.map((ug) => ug.userId))];

    if (candidateUserIds.length === 0) return [];

    const candidates = await this.prisma.profile.findMany({
      where: { userId: { in: candidateUserIds } },
      include: {
        user: {
          include: {
            userGames: { include: { game: true } },
          },
        },
      },
    });

    const hasPremiumFilters = myProfile?.isPremium && (
      myProfile.filterGender || myProfile.filterAgeMin != null ||
      myProfile.filterAgeMax != null || myProfile.filterMicOnly ||
      (myProfile.filterPlayStyles && myProfile.filterPlayStyles.length > 0) ||
      myProfile.filterActivity
    );

    const playStyleMap: Record<string, string> = {
      REKABETCI: 'COMPETITIVE',
      EGLENCE: 'CASUAL',
      TAKIM: 'TEAM_PLAYER',
      KESIF: 'EXPLORER',
    };

    const filtered = hasPremiumFilters
      ? candidates.filter((c) => {
          if (myProfile.filterGender) {
            const wanted = this.genderMap[myProfile.filterGender] || myProfile.filterGender;
            if (c.gender && c.gender !== wanted) return false;
          }
          if (c.dateOfBirth && (myProfile.filterAgeMin != null || myProfile.filterAgeMax != null)) {
            const age = this.getAge(c.dateOfBirth);
            if (myProfile.filterAgeMin != null && age < myProfile.filterAgeMin) return false;
            if (myProfile.filterAgeMax != null && myProfile.filterAgeMax < 50 && age > myProfile.filterAgeMax) return false;
          }
          if (myProfile.filterMicOnly && !c.usesMic) return false;
          if (myProfile.filterPlayStyles && myProfile.filterPlayStyles.length > 0) {
            const mapped = myProfile.filterPlayStyles.map((s) => playStyleMap[s] || s);
            if (c.playStyle && !mapped.includes(c.playStyle)) return false;
          }
          return true;
        })
      : candidates;

    const scored = filtered.map((candidate) => {
      const candidateGameIds = candidate.user.userGames.map((ug) => ug.gameId);
      const sharedGames = myGameIds.filter((id) =>
        candidateGameIds.includes(id),
      );

      let score = 20;

      if (sharedGames.length > 0) {
        score += Math.min(sharedGames.length * 12, 35);
      }
      if (gameId && sharedGames.includes(gameId)) score += 15;

      if (myProfile?.playStyle && candidate.playStyle === myProfile.playStyle) {
        score += 18;
      }

      if (myProfile?.gameLevel && candidate.gameLevel === myProfile.gameLevel) {
        score += 14;
      }

      if (myProfile?.usesMic === candidate.usesMic) {
        score += 12;
      }

      if (myProfile?.dateOfBirth && candidate.dateOfBirth) {
        const myYear = myProfile.dateOfBirth.getFullYear();
        const theirYear = candidate.dateOfBirth.getFullYear();
        const ageDiff = Math.abs(myYear - theirYear);
        if (ageDiff <= 2) score += 18;
        else if (ageDiff <= 4) score += 14;
        else if (ageDiff <= 7) score += 8;
        else if (ageDiff <= 10) score += 4;
      }

      score = Math.min(score, 100);

      const { user, ...profile } = candidate;
      const { passwordHash, refreshToken, ...safeUser } = user as any;

      return {
        ...profile,
        user: safeUser,
        compatibilityScore: score,
      };
    });

    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return scored.slice(0, limit);
  }
}
