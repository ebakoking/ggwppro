import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('register-token')
  registerToken(@Req() req: any, @Body() body: { pushToken: string }) {
    return this.notificationService.registerPushToken(req.user.id, body.pushToken);
  }
}
