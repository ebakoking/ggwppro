"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchService = class MatchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyMatches(userId, gameId) {
        const where = {
            OR: [{ userAId: userId }, { userBId: userId }],
        };
        if (gameId)
            where.gameId = gameId;
        const matches = await this.prisma.match.findMany({
            where,
            include: {
                game: true,
                userA: {
                    select: { id: true, username: true, profile: true },
                },
                userB: {
                    select: { id: true, username: true, profile: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return matches.map((m) => {
            const otherUser = m.userAId === userId ? m.userB : m.userA;
            return {
                matchId: m.id,
                game: m.game,
                createdAt: m.createdAt,
                otherUser,
                lastMessage: m.messages[0] || null,
            };
        });
    }
};
exports.MatchService = MatchService;
exports.MatchService = MatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchService);
//# sourceMappingURL=match.service.js.map