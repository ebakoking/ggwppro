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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const seed_bots_1 = require("./seed-bots");
let AdminController = class AdminController {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    checkAuth(authHeader) {
        const secret = this.config.get('ADMIN_SECRET') || 'ggwp-admin-2026';
        if (authHeader !== `Bearer ${secret}`) {
            throw new common_1.UnauthorizedException('Yetkisiz erişim');
        }
    }
    async listUsers(auth, page = '1', limit = '50') {
        this.checkAuth(auth);
        const take = Math.min(Number(limit) || 50, 100);
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    emailVerified: true,
                    createdAt: true,
                    profile: {
                        select: {
                            displayName: true,
                            gender: true,
                            playStyle: true,
                            bio: true,
                            isPremium: true,
                            avatarUrl: true,
                        },
                    },
                },
            }),
            this.prisma.user.count(),
        ]);
        return { users, total, page: Number(page), limit: take };
    }
    async stats(auth) {
        this.checkAuth(auth);
        const [totalUsers, totalMatches, totalMessages, totalPosts, pendingReports] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.match.count(),
            this.prisma.message.count(),
            this.prisma.forumPost.count(),
            this.prisma.report.count({ where: { status: 'PENDING' } }),
        ]);
        return { totalUsers, totalMatches, totalMessages, totalPosts, pendingReports };
    }
    async listReports(auth, status) {
        this.checkAuth(auth);
        const reports = await this.prisma.report.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { id: true, username: true, email: true, profile: { select: { displayName: true } } },
                },
                reported: {
                    select: { id: true, username: true, email: true, profile: { select: { displayName: true } } },
                },
            },
        });
        return { reports };
    }
    async updateReportStatus(auth, reportId, body) {
        this.checkAuth(auth);
        await this.prisma.report.update({
            where: { id: reportId },
            data: { status: body.status || 'REVIEWED' },
        });
        return { ok: true };
    }
    async seedBotsEndpoint(auth, count = '100') {
        this.checkAuth(auth);
        const result = await (0, seed_bots_1.seedBots)(this.prisma, Math.min(Number(count) || 100, 500));
        return { ok: true, ...result };
    }
    async deleteUser(auth, userId) {
        this.checkAuth(auth);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        await this.prisma.user.delete({ where: { id: userId } });
        return { ok: true, deleted: user.username };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listReports", null);
__decorate([
    (0, common_1.Post)('reports/:reportId/status'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('reportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateReportStatus", null);
__decorate([
    (0, common_1.Post)('seed-bots'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "seedBotsEndpoint", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map