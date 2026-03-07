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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GameService = class GameService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllGames(category) {
        const where = category ? { category: category } : {};
        return this.prisma.gameCatalog.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async getMyGames(userId) {
        return this.prisma.userGame.findMany({
            where: { userId },
            include: { game: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async setMyGames(userId, games) {
        await this.prisma.userGame.deleteMany({ where: { userId } });
        if (games.length === 0)
            return [];
        await this.prisma.userGame.createMany({
            data: games.map((g) => ({
                userId,
                gameId: g.gameId,
                rank: g.rank || null,
                role: g.role || null,
            })),
        });
        return this.getMyGames(userId);
    }
    async addGame(userId, gameId, rank, role) {
        return this.prisma.userGame.upsert({
            where: { userId_gameId: { userId, gameId } },
            update: { rank, role },
            create: { userId, gameId, rank, role },
            include: { game: true },
        });
    }
    async removeGame(userId, gameId) {
        await this.prisma.userGame.deleteMany({
            where: { userId, gameId },
        });
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameService);
//# sourceMappingURL=game.service.js.map