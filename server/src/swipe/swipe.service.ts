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

    if (action === SwipeAction.LIKE || action === SwipeAction.PENTAKILL) {
      const genelGame = await this.prisma.gameCatalog.findFirst({
        where: { slug: 'genel' },
        select: { id: true },
      });
      const gameIds = [gameId];
      if (genelGame && genelGame.id !== gameId) gameIds.push(genelGame.id);

      const reciprocal = await this.prisma.swipe.findFirst({
        where: {
          fromId: toId,
          toId: fromId,
          gameId: { in: gameIds },
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

        this.notifications
          .sendPushToMany(
            [fromId, toId],
            'Yeni Eşleşme! 🎮',
            'Birisiyle eşleştin! Hemen sohbete başla.',
            { type: 'match' },
          )
          .catch(() => {});
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
