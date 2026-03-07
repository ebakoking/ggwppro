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
exports.SwipeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let SwipeService = class SwipeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async swipe(fromId, toId, action, gameId) {
        if (fromId === toId)
            throw new common_1.BadRequestException('Cannot swipe yourself');
        if (action !== client_1.SwipeAction.PENTAKILL) {
            const profile = await this.prisma.profile.findUnique({ where: { userId: fromId } });
            if (profile && !profile.isPremium) {
                const now = new Date();
                const lastReset = profile.lastLikeResetAt ? new Date(profile.lastLikeResetAt) : new Date(0);
                const isSameDay = now.toDateString() === lastReset.toDateString();
                if (!isSameDay) {
                    await this.prisma.profile.update({
                        where: { userId: fromId },
                        data: { dailyLikesUsed: 1, lastLikeResetAt: now },
                    });
                }
                else {
                    if (profile.dailyLikesUsed >= 30) {
                        throw new common_1.BadRequestException('Günlük swipe limitine ulaştınız. Premium ile sınırsız keşfedin!');
                    }
                    await this.prisma.profile.update({
                        where: { userId: fromId },
                        data: { dailyLikesUsed: { increment: 1 } },
                    });
                }
            }
        }
        const swipe = await this.prisma.swipe.upsert({
            where: { fromId_toId_gameId: { fromId, toId, gameId } },
            update: { action },
            create: { fromId, toId, action, gameId },
        });
        let matched = false;
        if (action === client_1.SwipeAction.LIKE || action === client_1.SwipeAction.PENTAKILL) {
            const reciprocal = await this.prisma.swipe.findFirst({
                where: {
                    fromId: toId,
                    toId: fromId,
                    gameId,
                    action: { in: [client_1.SwipeAction.LIKE, client_1.SwipeAction.PENTAKILL] },
                },
            });
            if (reciprocal) {
                const [a, b] = [fromId, toId].sort();
                await this.prisma.match.upsert({
                    where: {
                        userAId_userBId_gameId: { userAId: a, userBId: b, gameId },
                    },
                    update: {},
                    create: { userAId: a, userBId: b, gameId },
                });
                matched = true;
            }
        }
        return { swipe, matched };
    }
    async getWhoLikedMe(userId, gameId) {
        return this.prisma.swipe.findMany({
            where: {
                toId: userId,
                gameId,
                action: { in: [client_1.SwipeAction.LIKE, client_1.SwipeAction.PENTAKILL] },
            },
            include: {
                from: {
                    select: { id: true, username: true, profile: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.SwipeService = SwipeService;
exports.SwipeService = SwipeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SwipeService);
//# sourceMappingURL=swipe.service.js.map