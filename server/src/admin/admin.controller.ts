import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Headers,
  UnauthorizedException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller('admin')
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private checkAuth(authHeader: string | undefined) {
    const secret = this.config.get('ADMIN_SECRET') || 'ggwp-admin-2026';
    if (authHeader !== `Bearer ${secret}`) {
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
    const [totalUsers, totalMatches, totalMessages, totalPosts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.match.count(),
      this.prisma.message.count(),
      this.prisma.forumPost.count(),
    ]);
    return { totalUsers, totalMatches, totalMessages, totalPosts };
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
