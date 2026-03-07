import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async getMessages(matchId: string, userId: string, cursor?: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== userId && match.userBId !== userId)
      throw new ForbiddenException('Not your match');

    return this.prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: { sender: { select: { id: true, username: true } } },
    });
  }

  async sendMessage(matchId: string, senderId: string, content: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== senderId && match.userBId !== senderId)
      throw new ForbiddenException('Not your match');

    return this.prisma.message.create({
      data: { matchId, senderId, content },
      include: { sender: { select: { id: true, username: true } } },
    });
  }

  async markAsRead(matchId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }
}
