import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { seedBots } from './seed-bots';

@Controller('admin')
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private checkAuth(authHeader: string | undefined) {
    const secret = this.config.get('ADMIN_SECRET');
    if (!secret) {
      throw new UnauthorizedException('ADMIN_SECRET ortam değişkeni tanımlı değil');
    }
    const expected = Buffer.from(`Bearer ${secret}`, 'utf-8');
    const actual = Buffer.from(authHeader || '', 'utf-8');
    if (
      expected.length !== actual.length ||
      !require('crypto').timingSafeEqual(expected, actual)
    ) {
      throw new UnauthorizedException('Yetkisiz erişim');
    }
  }

  @Get('users')
  async listUsers(
    @Headers('authorization') auth: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    this.checkAuth(auth);
    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          emailVerified: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              gender: true,
              playStyle: true,
              bio: true,
              isPremium: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total, page: Number(page), limit: take };
  }

  @Get('stats')
  async stats(@Headers('authorization') auth: string) {
    this.checkAuth(auth);
    const [totalUsers, totalMatches, totalMessages, totalPosts, pendingReports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.match.count(),
      this.prisma.message.count(),
      this.prisma.forumPost.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    return { totalUsers, totalMatches, totalMessages, totalPosts, pendingReports };
  }

  @Get('reports')
  async listReports(
    @Headers('authorization') auth: string,
    @Query('status') status?: string,
  ) {
    this.checkAuth(auth);
    const reports = await this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, username: true, email: true, profile: { select: { displayName: true } } },
        },
        reported: {
          select: { id: true, username: true, email: true, profile: { select: { displayName: true } } },
        },
      },
    });
    return { reports };
  }

  @Post('reports/:reportId/status')
  async updateReportStatus(
    @Headers('authorization') auth: string,
    @Param('reportId') reportId: string,
    @Body() body: { status: string },
  ) {
    this.checkAuth(auth);
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: body.status || 'REVIEWED' },
    });
    return { ok: true };
  }

  @Post('seed-bots')
  async seedBotsEndpoint(
    @Headers('authorization') auth: string,
    @Query('count') count = '100',
  ) {
    this.checkAuth(auth);
    const result = await seedBots(this.prisma, Math.min(Number(count) || 100, 500));
    return { ok: true, ...result };
  }

  @Delete('users/:userId')
  async deleteUser(
    @Headers('authorization') auth: string,
    @Param('userId') userId: string,
  ) {
    this.checkAuth(auth);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true, deleted: user.username };
  }
}
