import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get(':matchId')
  getMessages(
    @Param('matchId') matchId: string,
    @Req() req: any,
    @Query('cursor') cursor?: string,
  ) {
    return this.messageService.getMessages(matchId, req.user.id, cursor);
  }

  @Post(':matchId')
  sendMessage(
    @Param('matchId') matchId: string,
    @Req() req: any,
    @Body() body: { content: string },
  ) {
    return this.messageService.sendMessage(matchId, req.user.id, body.content);
  }

  @Post(':matchId/read')
  markAsRead(@Param('matchId') matchId: string, @Req() req: any) {
    return this.messageService.markAsRead(matchId, req.user.id);
  }
}
