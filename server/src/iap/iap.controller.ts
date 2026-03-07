import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { IapService } from './iap.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile/iap')
@UseGuards(JwtAuthGuard)
export class IapController {
  constructor(private iapService: IapService) {}

  @Post('complete')
  async complete(
    @Req() req: any,
    @Body() body: { platform: string; productId: string; receiptData: string },
  ) {
    const { platform, productId, receiptData } = body;
    if (!platform || !productId || !receiptData) {
      throw new BadRequestException(
        'platform, productId ve receiptData gerekli.',
      );
    }
    return this.iapService.verifyAndGrant(
      req.user.id,
      platform,
      productId,
      receiptData,
    );
  }
}
