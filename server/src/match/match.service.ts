import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async getMyMatches(userId: string, gameId?: string) {
    const blockedByMe = await this.prisma.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    const blockedMe = await this.prisma.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    });
    const blockedIds = [
      ...blockedByMe.map((b) => b.blockedId),
      ...blockedMe.map((b) => b.blockerId),
    ];

    const where: any = {
      OR: [{ userAId: userId }, { userBId: userId }],
    };
    if (gameId) where.gameId = gameId;
    if (blockedIds.length > 0) {
      where.AND = [
        { userAId: { notIn: blockedIds } },
        { userBId: { notIn: blockedIds } },
      ];
    }

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        game: true,
        userA: {
          select: { id: true, username: true, profile: true },
        },
        userB: {
          select: { id: true, username: true, profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return matches.map((m) => {
      const otherUser = m.userAId === userId ? m.userB : m.userA;
      return {
        matchId: m.id,
        game: m.game,
        createdAt: m.createdAt,
        otherUser,
        lastMessage: m.messages[0] || null,
      };
    });
  }

  async deleteMatch(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Eşleşme bulunamadı.');
    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException('Bu eşleşmeyi silme yetkiniz yok.');
    }

    await this.prisma.message.deleteMany({ where: { matchId } });
    await this.prisma.match.delete({ where: { id: matchId } });
    return { ok: true };
  }

  async blockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });

    const mutualMatches = await this.prisma.match.findMany({
      where: {
        OR: [
          { userAId: blockerId, userBId: blockedId },
          { userAId: blockedId, userBId: blockerId },
        ],
      },
    });
    for (const m of mutualMatches) {
      await this.prisma.message.deleteMany({ where: { matchId: m.id } });
      await this.prisma.match.delete({ where: { id: m.id } });
    }

    return { ok: true };
  }
}
