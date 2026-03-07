import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getMyProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya gerekli.');
    return this.profileService.uploadAvatar(req.user.id, file);
  }

  @Post('pentakill/use')
  usePentakill(@Req() req: any) {
    return this.profileService.usePentakill(req.user.id);
  }

  @Post('filters')
  saveFilters(@Req() req: any, @Body() body: {
    filterGender?: string;
    filterAgeMin?: number;
    filterAgeMax?: number;
    filterMicOnly?: boolean;
    filterPlayStyles?: string[];
    filterActivity?: string;
  }) {
    return this.profileService.saveFilters(req.user.id, body);
  }

  @Post('premium/activate')
  activatePremium(@Req() req: any, @Body() body: { planId: string }) {
    return this.profileService.activatePremium(req.user.id, body.planId);
  }

  @Post('pentakill/purchase')
  purchasePentakill(@Req() req: any, @Body() body: { packageId: string }) {
    return this.profileService.purchasePentakill(req.user.id, body.packageId);
  }

  @Get(':userId')
  getProfileById(@Param('userId') userId: string) {
    return this.profileService.getProfileById(userId);
  }
}
