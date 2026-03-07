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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportService = class ReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(reporterId, reportedId, reason, details, matchId, messageId) {
        if (reporterId === reportedId) {
            throw new common_1.ForbiddenException('Kendinizi raporlayamazsınız.');
        }
        const reported = await this.prisma.user.findUnique({
            where: { id: reportedId },
        });
        if (!reported)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı.');
        return this.prisma.report.create({
            data: {
                reporterId,
                reportedId,
                reason,
                details,
                matchId,
                messageId,
            },
        });
    }
    async listForAdmin(status) {
        return this.prisma.report.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { displayName: true } },
                    },
                },
                reported: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { displayName: true } },
                    },
                },
            },
        });
    }
    async updateStatus(reportId, status) {
        return this.prisma.report.update({
            where: { id: reportId },
            data: { status },
        });
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportService);
//# sourceMappingURL=report.service.js.map