import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get()
  getAllGames(@Query('category') category?: string) {
    return this.gameService.getAllGames(category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGames(@Req() req: any) {
    return this.gameService.getMyGames(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my')
  setMyGames(
    @Req() req: any,
    @Body() body: { games: { gameId: string; rank?: string; role?: string }[] },
  ) {
    return this.gameService.setMyGames(req.user.id, body.games);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my/add')
  addGame(
    @Req() req: any,
    @Body() body: { gameId: string; rank?: string; role?: string },
  ) {
    return this.gameService.addGame(
      req.user.id,
      body.gameId,
      body.rank,
      body.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('my/:gameId')
  removeGame(@Req() req: any, @Param('gameId') gameId: string) {
    return this.gameService.removeGame(req.user.id, gameId);
  }
}
