import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    @Body() body: { content?: string; messageType?: string; audioUrl?: string },
  ) {
    const content = body.content ?? '';
    const opts = body.audioUrl
      ? { messageType: 'VOICE' as const, audioUrl: body.audioUrl }
      : undefined;
    return this.messageService.sendMessage(matchId, req.user.id, content, opts);
  }

  @Post(':matchId/upload-voice')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadVoice(
    @Param('matchId') matchId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Ses dosyası gerekli.');
    return this.messageService.uploadVoice(matchId, req.user.id, file);
  }

  @Post(':matchId/read')
  markAsRead(@Param('matchId') matchId: string, @Req() req: any) {
    return this.messageService.markAsRead(matchId, req.user.id);
  }
}
