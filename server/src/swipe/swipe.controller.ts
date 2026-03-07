import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SwipeAction } from '@prisma/client';
import { SwipeService } from './swipe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('swipe')
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(private swipeService: SwipeService) {}

  @Post()
  swipe(
    @Req() req: any,
    @Body() body: { toId: string; action: SwipeAction; gameId: string },
  ) {
    return this.swipeService.swipe(
      req.user.id,
      body.toId,
      body.action,
      body.gameId,
    );
  }

  @Get('who-liked-me')
  whoLikedMe(@Req() req: any, @Query('gameId') gameId: string) {
    return this.swipeService.getWhoLikedMe(req.user.id, gameId);
  }
}
