import { Injectable, BadRequestException } from '@nestjs/common';
import { SwipeAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SwipeService {
  constructor(private prisma: PrismaService) {}

  async swipe(
    fromId: string,
    toId: string,
    action: SwipeAction,
    gameId: string,
  ) {
    if (fromId === toId)
      throw new BadRequestException('Cannot swipe yourself');

    if (action !== SwipeAction.PENTAKILL) {
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
          if (profile.dailyLikesUsed >= 30) {
            throw new BadRequestException('Günlük swipe limitine ulaştınız. Premium ile sınırsız keşfedin!');
          }
          await this.prisma.profile.update({
            where: { userId: fromId },
            data: { dailyLikesUsed: { increment: 1 } },
          });
        }
      }
    }

    const swipe = await this.prisma.swipe.upsert({
      where: { fromId_toId_gameId: { fromId, toId, gameId } },
      update: { action },
      create: { fromId, toId, action, gameId },
    });

    let matched = false;

    if (action === SwipeAction.LIKE || action === SwipeAction.PENTAKILL) {
      const reciprocal = await this.prisma.swipe.findFirst({
        where: {
          fromId: toId,
          toId: fromId,
          gameId,
          action: { in: [SwipeAction.LIKE, SwipeAction.PENTAKILL] },
        },
      });

      if (reciprocal) {
        const [a, b] = [fromId, toId].sort();
        await this.prisma.match.upsert({
          where: {
            userAId_userBId_gameId: { userAId: a, userBId: b, gameId },
          },
          update: {},
          create: { userAId: a, userBId: b, gameId },
        });
        matched = true;
      }
    }

    return { swipe, matched };
  }

  async getWhoLikedMe(userId: string, gameId: string) {
    return this.prisma.swipe.findMany({
      where: {
        toId: userId,
        gameId,
        action: { in: [SwipeAction.LIKE, SwipeAction.PENTAKILL] },
      },
      include: {
        from: {
          select: { id: true, username: true, profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
