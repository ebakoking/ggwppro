import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { reportedId: string; reason: string; details?: string; matchId?: string; messageId?: string },
  ) {
    return this.reportService.create(
      req.user.id,
      body.reportedId,
      body.reason,
      body.details,
      body.matchId,
      body.messageId,
    );
  }
}
