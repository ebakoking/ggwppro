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
exports.ForumService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ForumService = class ForumService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPosts(gameId, limit = 20, cursor) {
        const where = {};
        if (gameId)
            where.gameId = gameId;
        return this.prisma.forumPost.findMany({
            where,
            include: {
                author: { select: { id: true, username: true, profile: true } },
                game: true,
                _count: { select: { comments: true, likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
    }
    async getPost(postId) {
        const post = await this.prisma.forumPost.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, username: true, profile: true } },
                game: true,
                comments: {
                    include: {
                        author: { select: { id: true, username: true, profile: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { likes: true } },
            },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async createPost(authorId, data) {
        return this.prisma.forumPost.create({
            data: {
                authorId,
                gameId: data.gameId,
                title: data.title,
                content: data.content,
                linkUrl: data.linkUrl,
            },
            include: {
                author: { select: { id: true, username: true, profile: true } },
                game: true,
            },
        });
    }
    async addComment(postId, authorId, content) {
        const [comment] = await this.prisma.$transaction([
            this.prisma.forumComment.create({
                data: { postId, authorId, content },
                include: {
                    author: { select: { id: true, username: true, profile: true } },
                },
            }),
            this.prisma.forumPost.update({
                where: { id: postId },
                data: { commentCount: { increment: 1 } },
            }),
        ]);
        return comment;
    }
    async toggleLike(postId, userId) {
        const existing = await this.prisma.forumLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            await this.prisma.$transaction([
                this.prisma.forumLike.delete({
                    where: { id: existing.id },
                }),
                this.prisma.forumPost.update({
                    where: { id: postId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ]);
            return { liked: false };
        }
        else {
            await this.prisma.$transaction([
                this.prisma.forumLike.create({
                    data: { postId, userId },
                }),
                this.prisma.forumPost.update({
                    where: { id: postId },
                    data: { likeCount: { increment: 1 } },
                }),
            ]);
            return { liked: true };
        }
    }
};
exports.ForumService = ForumService;
exports.ForumService = ForumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ForumService);
//# sourceMappingURL=forum.service.js.map