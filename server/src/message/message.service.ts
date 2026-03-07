import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

const VOICE_DIR = path.join(process.cwd(), 'uploads', 'voice');

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

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

  async sendMessage(
    matchId: string,
    senderId: string,
    content: string,
    opts?: { messageType?: string; audioUrl?: string },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== senderId && match.userBId !== senderId)
      throw new ForbiddenException('Not your match');

    const message = await this.prisma.message.create({
      data: {
        matchId,
        senderId,
        content: content || '',
        messageType: opts?.messageType || 'TEXT',
        audioUrl: opts?.audioUrl,
      },
      include: { sender: { select: { id: true, username: true } } },
    });

    const recipientId = match.userAId === senderId ? match.userBId : match.userAId;
    const senderName = message.sender?.username || 'Birisi';
    const preview = opts?.messageType === 'VOICE' ? '🎤 Ses mesajı' : (content?.slice(0, 50) || '');
    this.notifications
      .sendPush(recipientId, senderName, preview, { type: 'message', matchId })
      .catch(() => {});

    return message;
  }

  async markAsRead(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== userId && match.userBId !== userId)
      throw new ForbiddenException('Not your match');

    await this.prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  async uploadVoice(matchId: string, userId: string, file: Express.Multer.File) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.userAId !== userId && match.userBId !== userId)
      throw new ForbiddenException('Not your match');

    if (!file?.buffer) {
      throw new BadRequestException('Ses dosyası boş veya okunamadı.');
    }
    const isAudio =
      file.mimetype?.includes('audio') ||
      file.mimetype?.includes('video/mp4') ||
      file.originalname?.endsWith('.m4a') ||
      file.originalname?.endsWith('.mp3') ||
      file.originalname?.endsWith('.caf');
    if (!isAudio) {
      throw new BadRequestException('Geçerli bir ses dosyası yükleyin.');
    }
    if (!fs.existsSync(VOICE_DIR)) {
      fs.mkdirSync(VOICE_DIR, { recursive: true });
    }
    const ext = file.mimetype.includes('mpeg') || file.mimetype.includes('mp3') ? '.mp3' : '.m4a';
    const filename = `${matchId}-${userId}-${Date.now()}${ext}`;
    const filepath = path.join(VOICE_DIR, filename);
    fs.writeFileSync(filepath, file.buffer);
    const audioUrl = `/uploads/voice/${filename}`;
    return { audioUrl };
  }
}
