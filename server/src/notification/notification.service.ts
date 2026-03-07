import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async registerPushToken(userId: string, pushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
    return { ok: true };
  }

  async sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) return;

    const message: ExpoPushMessage = {
      to: user.pushToken,
      title,
      body,
      data,
      sound: 'default',
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.error('[Push] Bildirim gönderilemedi:', err);
    }
  }

  async sendPushToMany(userIds: string[], title: string, body: string, data?: Record<string, unknown>) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, pushToken: { not: null } },
      select: { pushToken: true },
    });

    const messages: ExpoPushMessage[] = users
      .filter((u) => u.pushToken)
      .map((u) => ({
        to: u.pushToken!,
        title,
        body,
        data,
        sound: 'default' as const,
      }));

    if (messages.length === 0) return;

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (err) {
      console.error('[Push] Toplu bildirim gönderilemedi:', err);
    }
  }
}
