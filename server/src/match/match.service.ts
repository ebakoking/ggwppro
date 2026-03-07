import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async getMyMatches(userId: string, gameId?: string) {
    const where: any = {
      OR: [{ userAId: userId }, { userBId: userId }],
    };
    if (gameId) where.gameId = gameId;

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
}
