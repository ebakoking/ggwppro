import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const VERIFICATION_EXPIRY_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Şifre ve şifre tekrarı eşleşmiyor.');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingEmail) throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');

    const normalizedUsername = dto.username.trim().toLowerCase();
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername)
      throw new ConflictException('Bu kullanıcı adı zaten alınmış.');

    const hash = await bcrypt.hash(dto.password, 12);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        username: normalizedUsername,
        passwordHash: hash,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
        profile: { create: {} },
      },
    });

    this.mail.sendVerificationEmail(user.email, user.username, token).catch(() => {});

    this.autoGreetNewUser(user.id).catch(() => {});

    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      ...tokens,
    };
  }

  private async autoGreetNewUser(newUserId: string) {
    const allBots = await this.prisma.user.findMany({
      where: { email: { endsWith: '@ggwp.bot' } },
      select: { id: true },
    });
    if (allBots.length === 0) return;

    const shuffled = allBots.sort(() => Math.random() - 0.5);
    const greeterBots = shuffled.slice(0, Math.min(8, shuffled.length));

    const genelGame = await this.prisma.gameCatalog.findFirst({
      where: { slug: 'genel' },
    });
    if (!genelGame) return;

    for (const bot of greeterBots) {
      await this.prisma.swipe.upsert({
        where: {
          fromId_toId_gameId: {
            fromId: bot.id,
            toId: newUserId,
            gameId: genelGame.id,
          },
        },
        update: {},
        create: {
          fromId: bot.id,
          toId: newUserId,
          action: 'LIKE',
          gameId: genelGame.id,
        },
      }).catch(() => {});
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.username.toLowerCase().trim() },
          { username: dto.username.toLowerCase().trim() },
        ],
      },
    });
    if (!user) throw new UnauthorizedException('Geçersiz kimlik bilgileri.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Geçersiz kimlik bilgileri.');

    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException(
        'Doğrulama linki geçersiz veya süresi dolmuş. Yeni link için e-posta doğrulamayı tekrar gönderin.',
      );
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });
    return { message: 'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      return { message: 'Eğer bu adres kayıtlıysa doğrulama e-postası gönderildi.' };
    }
    if (user.emailVerified) {
      throw new BadRequestException('Bu e-posta adresi zaten doğrulanmış.');
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });
    await this.mail.sendVerificationEmail(user.email, user.username, token);
    return { message: 'Doğrulama e-postası tekrar gönderildi.' };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const valid = await bcrypt.compare(rt, user.refreshToken);
    if (!valid) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async generateTokens(userId: string, username: string) {
    const payload = { sub: userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }
}
