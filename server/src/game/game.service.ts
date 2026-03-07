import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getAllGames(category?: string) {
    const where = category ? { category: category as any } : {};
    return this.prisma.gameCatalog.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getMyGames(userId: string) {
    return this.prisma.userGame.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setMyGames(
    userId: string,
    games: { gameId: string; rank?: string; role?: string }[],
  ) {
    await this.prisma.userGame.deleteMany({ where: { userId } });

    if (games.length === 0) return [];

    await this.prisma.userGame.createMany({
      data: games.map((g) => ({
        userId,
        gameId: g.gameId,
        rank: g.rank || null,
        role: g.role || null,
      })),
    });

    return this.getMyGames(userId);
  }

  async addGame(
    userId: string,
    gameId: string,
    rank?: string,
    role?: string,
  ) {
    return this.prisma.userGame.upsert({
      where: { userId_gameId: { userId, gameId } },
      update: { rank, role },
      create: { userId, gameId, rank, role },
      include: { game: true },
    });
  }

  async removeGame(userId: string, gameId: string) {
    await this.prisma.userGame.deleteMany({
      where: { userId, gameId },
    });
  }
}
