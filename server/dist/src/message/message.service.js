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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../prisma/prisma.service");
const VOICE_DIR = path.join(process.cwd(), 'uploads', 'voice');
let MessageService = class MessageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMessages(matchId, userId, cursor) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.userAId !== userId && match.userBId !== userId)
            throw new common_1.ForbiddenException('Not your match');
        return this.prisma.message.findMany({
            where: { matchId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            include: { sender: { select: { id: true, username: true } } },
        });
    }
    async sendMessage(matchId, senderId, content, opts) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.userAId !== senderId && match.userBId !== senderId)
            throw new common_1.ForbiddenException('Not your match');
        return this.prisma.message.create({
            data: {
                matchId,
                senderId,
                content: content || '',
                messageType: opts?.messageType || 'TEXT',
                audioUrl: opts?.audioUrl,
            },
            include: { sender: { select: { id: true, username: true } } },
        });
    }
    async markAsRead(matchId, userId) {
        await this.prisma.message.updateMany({
            where: {
                matchId,
                senderId: { not: userId },
                read: false,
            },
            data: { read: true },
        });
    }
    async uploadVoice(matchId, userId, file) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.userAId !== userId && match.userBId !== userId)
            throw new common_1.ForbiddenException('Not your match');
        if (!file?.buffer || !file.mimetype?.includes('audio')) {
            throw new common_1.BadRequestException('Geçerli bir ses dosyası yükleyin.');
        }
        if (!fs.existsSync(VOICE_DIR)) {
            fs.mkdirSync(VOICE_DIR, { recursive: true });
        }
        const ext = file.mimetype.includes('mpeg') || file.mimetype.includes('mp3') ? '.mp3' : '.m4a';
        const filename = `${matchId}-${userId}-${Date.now()}${ext}`;
        const filepath = path.join(VOICE_DIR, filename);
        fs.writeFileSync(filepath, file.buffer);
        const audioUrl = `/uploads/voice/${filename}`;
        return { audioUrl };
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessageService);
//# sourceMappingURL=message.service.js.map