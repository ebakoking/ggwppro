import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoverController {
  constructor(private discoverService: DiscoverService) {}

  @Get()
  getFeed(
    @Req() req: any,
    @Query('gameId') gameId: string | undefined,
    @Query('limit') limit = '10',
  ) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    return this.discoverService.getDiscoverFeed(
      req.user.id,
      gameId || undefined,
      safeLimit,
    );
  }
}
