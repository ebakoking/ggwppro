import { Controller, Get, Delete, Post, Query, Param, Body, UseGuards, Req } from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Get()
  getMyMatches(@Req() req: any, @Query('gameId') gameId?: string) {
    return this.matchService.getMyMatches(req.user.id, gameId);
  }

  @Delete(':id')
  deleteMatch(@Req() req: any, @Param('id') id: string) {
    return this.matchService.deleteMatch(id, req.user.id);
  }

  @Post('block')
  blockUser(@Req() req: any, @Body('blockedId') blockedId: string) {
    return this.matchService.blockUser(req.user.id, blockedId);
  }
}
