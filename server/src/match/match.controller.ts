import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
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
}
