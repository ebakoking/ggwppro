"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const VERIFICATION_EXPIRY_HOURS = 24;
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    mail;
    constructor(prisma, jwt, config, mail) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.mail = mail;
    }
    async register(dto) {
        if (dto.password !== dto.passwordConfirm) {
            throw new common_1.BadRequestException('Şifre ve şifre tekrarı eşleşmiyor.');
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (existingEmail)
            throw new common_1.ConflictException('Bu e-posta adresi zaten kayıtlı.');
        const normalizedUsername = dto.username.trim().toLowerCase();
        const existingUsername = await this.prisma.user.findUnique({
            where: { username: normalizedUsername },
        });
        if (existingUsername)
            throw new common_1.ConflictException('Bu kullanıcı adı zaten alınmış.');
        const hash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase().trim(),
                username: normalizedUsername,
                passwordHash: hash,
                emailVerified: false,
                profile: { create: {} },
            },
        });
        const tokens = await this.generateTokens(user.id, user.username);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: { id: user.id, username: user.username, email: user.email },
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.username.toLowerCase().trim() },
                    { username: dto.username.toLowerCase().trim() },
                ],
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Geçersiz kimlik bilgileri.');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Geçersiz kimlik bilgileri.');
        const tokens = await this.generateTokens(user.id, user.username);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: { id: user.id, username: user.username, email: user.email },
            ...tokens,
        };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpiresAt: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Doğrulama linki geçersiz veya süresi dolmuş. Yeni link için e-posta doğrulamayı tekrar gönderin.');
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
    async resendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            return { message: 'Eğer bu adres kayıtlıysa doğrulama e-postası gönderildi.' };
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Bu e-posta adresi zaten doğrulanmış.');
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
    async refreshTokens(userId, rt) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.refreshToken)
            throw new common_1.UnauthorizedException('Access denied');
        const valid = await bcrypt.compare(rt, user.refreshToken);
        if (!valid)
            throw new common_1.UnauthorizedException('Access denied');
        const tokens = await this.generateTokens(user.id, user.username);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }
    async generateTokens(userId, username) {
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
    async updateRefreshToken(userId, rt) {
        const hash = await bcrypt.hash(rt, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hash },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map