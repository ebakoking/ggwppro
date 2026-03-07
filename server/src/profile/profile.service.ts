import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            userGames: { include: { game: true } },
          },
        },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const { user, ...rest } = profile;
    const {
      passwordHash,
      refreshToken,
      emailVerificationToken,
      emailVerificationExpiresAt,
      ...safeUser
    } = user as any;
    return { ...rest, user: safeUser };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile?.isPremium) {
      throw new BadRequestException('Kendi fotoğrafınızı yüklemek için Premium üyelik gerekir.');
    }
    if (!file?.buffer || !file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Geçerli bir resim yükleyin.');
    }
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const filename = userId + ext;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, file.buffer);
    const avatarUrl = `/uploads/avatars/${filename}`;
    await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });
    return { avatarUrl };
  }

  private static PACKAGES: Record<string, number> = {
    single: 1,
    pack: 5,
    series: 20,
  };

  async usePentakill(userId: string) {
    const result = await this.prisma.profile.updateMany({
      where: { userId, pentakillsLeft: { gt: 0 } },
      data: { pentakillsLeft: { decrement: 1 } },
    });
    if (result.count === 0) {
      throw new BadRequestException('Pentakill hakkınız kalmadı.');
    }
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    return { pentakillsLeft: profile!.pentakillsLeft };
  }

  async saveFilters(userId: string, filters: {
    filterGender?: string;
    filterAgeMin?: number;
    filterAgeMax?: number;
    filterMicOnly?: boolean;
    filterPlayStyles?: string[];
    filterActivity?: string;
  }) {
    return this.prisma.profile.update({
      where: { userId },
      data: filters,
    });
  }

  async activatePremium(userId: string, planId: string) {
    const durations: Record<string, number> = { weekly: 7, monthly: 30 };
    const days = durations[planId];
    if (!days) throw new BadRequestException('Geçersiz plan.');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { isPremium: true, premiumPlan: planId, premiumExpiresAt: expiresAt },
    });
    return { isPremium: profile.isPremium, premiumPlan: profile.premiumPlan, premiumExpiresAt: profile.premiumExpiresAt };
  }

  async purchasePentakill(userId: string, packageId: string) {
    const amount = ProfileService.PACKAGES[packageId];
    if (!amount) throw new BadRequestException('Geçersiz paket.');
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { pentakillsLeft: { increment: amount } },
    });
    return { pentakillsLeft: profile.pentakillsLeft, added: amount };
  }

  async getProfileById(profileUserId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: profileUserId },
      include: {
        user: {
          include: {
            userGames: { include: { game: true } },
          },
        },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const { user, ...rest } = profile;
    const {
      passwordHash,
      refreshToken,
      emailVerificationToken,
      emailVerificationExpiresAt,
      ...safeUser
    } = user as any;
    return { ...rest, user: safeUser };
  }
}
