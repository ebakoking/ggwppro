import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(
    reporterId: string,
    reportedId: string,
    reason: string,
    details?: string,
    matchId?: string,
    messageId?: string,
  ) {
    if (reporterId === reportedId) {
      throw new ForbiddenException('Kendinizi raporlayamazsınız.');
    }
    const reported = await this.prisma.user.findUnique({
      where: { id: reportedId },
    });
    if (!reported) throw new NotFoundException('Kullanıcı bulunamadı.');

    return this.prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        details,
        matchId,
        messageId,
      },
    });
  }

  async listForAdmin(status?: string) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        reported: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });
  }

  async updateStatus(reportId: string, status: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }
}
