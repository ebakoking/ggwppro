import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { containsProfanity } from '../common/profanity-filter';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  async getPosts(gameId?: string, limit = 20, cursor?: string) {
    const where: any = {};
    if (gameId) where.gameId = gameId;

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

  async getPost(postId: string) {
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
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(
    authorId: string,
    data: { gameId: string; title: string; content: string; linkUrl?: string },
  ) {
    if (containsProfanity(data.title) || containsProfanity(data.content)) {
      throw new BadRequestException('İçeriğiniz uygunsuz ifadeler barındırıyor. Lütfen düzenleyin.');
    }
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

  async addComment(postId: string, authorId: string, content: string) {
    if (containsProfanity(content)) {
      throw new BadRequestException('Yorumunuz uygunsuz ifadeler barındırıyor. Lütfen düzenleyin.');
    }
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

  async toggleLike(postId: string, userId: string) {
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
    } else {
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

  async reportPost(postId: string, reporterId: string, reason: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new NotFoundException('Post bulunamadı');

    await this.prisma.report.create({
      data: {
        reporterId,
        reportedId: post.authorId,
        reason,
        details: `Forum post: ${postId}`,
      },
    });
    return { ok: true, message: 'Şikayetiniz alındı.' };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new NotFoundException('Post bulunamadı');
    if (post.authorId !== userId) {
      throw new BadRequestException('Sadece kendi paylaşımlarınızı silebilirsiniz.');
    }
    await this.prisma.forumPost.delete({ where: { id: postId } });
    return { ok: true };
  }
}
