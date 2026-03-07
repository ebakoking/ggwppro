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
var ProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
let ProfileService = class ProfileService {
    static { ProfileService_1 = this; }
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
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
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const { user, ...rest } = profile;
        const { passwordHash, refreshToken, ...safeUser } = user;
        return { ...rest, user: safeUser };
    }
    async updateProfile(userId, dto) {
        return this.prisma.profile.update({
            where: { userId },
            data: {
                ...dto,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            },
        });
    }
    async uploadAvatar(userId, file) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!profile?.isPremium) {
            throw new common_1.BadRequestException('Kendi fotoğrafınızı yüklemek için Premium üyelik gerekir.');
        }
        if (!file?.buffer || !file.mimetype?.startsWith('image/')) {
            throw new common_1.BadRequestException('Geçerli bir resim yükleyin.');
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
    static PACKAGES = {
        single: 1,
        pack: 5,
        series: 20,
    };
    async usePentakill(userId) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!profile || profile.pentakillsLeft <= 0) {
            throw new common_1.BadRequestException('Pentakill hakkınız kalmadı.');
        }
        const updated = await this.prisma.profile.update({
            where: { userId },
            data: { pentakillsLeft: { decrement: 1 } },
        });
        return { pentakillsLeft: updated.pentakillsLeft };
    }
    async saveFilters(userId, filters) {
        return this.prisma.profile.update({
            where: { userId },
            data: filters,
        });
    }
    async activatePremium(userId, planId) {
        const durations = { weekly: 7, monthly: 30 };
        const days = durations[planId];
        if (!days)
            throw new common_1.BadRequestException('Geçersiz plan.');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        const profile = await this.prisma.profile.update({
            where: { userId },
            data: { isPremium: true, premiumPlan: planId, premiumExpiresAt: expiresAt },
        });
        return { isPremium: profile.isPremium, premiumPlan: profile.premiumPlan, premiumExpiresAt: profile.premiumExpiresAt };
    }
    async purchasePentakill(userId, packageId) {
        const amount = ProfileService_1.PACKAGES[packageId];
        if (!amount)
            throw new common_1.BadRequestException('Geçersiz paket.');
        const profile = await this.prisma.profile.update({
            where: { userId },
            data: { pentakillsLeft: { increment: amount } },
        });
        return { pentakillsLeft: profile.pentakillsLeft, added: amount };
    }
    async getProfileById(profileUserId) {
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
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const { user, ...rest } = profile;
        const { passwordHash, refreshToken, ...safeUser } = user;
        return { ...rest, user: safeUser };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = ProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map