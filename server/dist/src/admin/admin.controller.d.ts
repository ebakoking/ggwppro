import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AdminController {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    private checkAuth;
    listUsers(auth: string, page?: string, limit?: string): Promise<{
        users: {
            id: string;
            email: string;
            username: string;
            emailVerified: boolean;
            createdAt: Date;
            profile: {
                displayName: string | null;
                avatarUrl: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                playStyle: import(".prisma/client").$Enums.PlayStyle | null;
                bio: string | null;
                isPremium: boolean;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    stats(auth: string): Promise<{
        totalUsers: number;
        totalMatches: number;
        totalMessages: number;
        totalPosts: number;
    }>;
    seedBotsEndpoint(auth: string, count?: string): Promise<{
        botsCreated: number;
        likesCreated: number;
        ok: boolean;
    }>;
    deleteUser(auth: string, userId: string): Promise<{
        ok: boolean;
        deleted: string;
    }>;
}
