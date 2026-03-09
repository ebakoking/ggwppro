import { Injectable, BadRequestException } from '@nestjs/common';
import { SwipeAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SwipeService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  async swipe(
    fromId: string,
    toId: string,
    action: SwipeAction,
    gameId: string,
  ) {
    if (fromId === toId)
      throw new BadRequestException('Cannot swipe yourself');

    if (action === SwipeAction.LIKE) {
      const profile = await this.prisma.profile.findUnique({ where: { userId: fromId } });
      if (profile && !profile.isPremium) {
        const now = new Date();
        const lastReset = profile.lastLikeResetAt ? new Date(profile.lastLikeResetAt) : new Date(0);
        const isSameDay = now.toDateString() === lastReset.toDateString();
        if (!isSameDay) {
          await this.prisma.profile.update({
            where: { userId: fromId },
            data: { dailyLikesUsed: 1, lastLikeResetAt: now },
          });
        } else {
          const result = await this.prisma.profile.updateMany({
            where: { userId: fromId, dailyLikesUsed: { lt: 30 } },
            data: { dailyLikesUsed: { increment: 1 } },
          });
          if (result.count === 0) {
            throw new BadRequestException('Günlük swipe limitine ulaştınız. Premium ile sınırsız keşfedin!');
          }
        }
      }
    }

    const swipe = await this.prisma.swipe.upsert({
      where: { fromId_toId_gameId: { fromId, toId, gameId } },
      update: { action },
      create: { fromId, toId, action, gameId },
    });

    let matched = false;
    let matchId: string | null = null;

    if (action === SwipeAction.LIKE || action === SwipeAction.PENTAKILL) {
      const reciprocal = await this.prisma.swipe.findFirst({
        where: {
          fromId: toId,
          toId: fromId,
          action: { in: [SwipeAction.LIKE, SwipeAction.PENTAKILL] },
        },
      });

      if (reciprocal) {
        const [a, b] = [fromId, toId].sort();
        const existingMatch = await this.prisma.match.findFirst({
          where: {
            userAId: a,
            userBId: b,
          },
        });

        if (!existingMatch) {
          const match = await this.prisma.match.create({
            data: { userAId: a, userBId: b, gameId },
          });
          matched = true;
          matchId = match.id;

          this.notifications
            .sendPushToMany(
              [fromId, toId],
              'Yeni Eşleşme! 🎮',
              'Birisiyle eşleştin! Hemen sohbete başla.',
              { type: 'match' },
            )
            .catch(() => {});
        } else {
          matched = true;
          matchId = existingMatch.id;
        }
      }
    }

    return { swipe, matched, matchId };
  }

  async getWhoLikedMe(userId: string, gameId?: string) {
    const mySwiped = await this.prisma.swipe.findMany({
      where: { fromId: userId },
      select: { toId: true },
    });
    const swipedIds = mySwiped.map((s) => s.toId);

    const where: any = {
      toId: userId,
      action: { in: [SwipeAction.LIKE, SwipeAction.PENTAKILL] },
    };
    if (swipedIds.length > 0) {
      where.fromId = { notIn: swipedIds };
    }
    if (gameId) where.gameId = gameId;

    return this.prisma.swipe.findMany({
      where,
      include: {
        from: {
          select: { id: true, username: true, profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
