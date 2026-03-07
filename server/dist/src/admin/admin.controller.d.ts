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
        pendingReports: number;
    }>;
    listReports(auth: string, status?: string): Promise<{
        reports: ({
            reporter: {
                id: string;
                email: string;
                username: string;
                profile: {
                    displayName: string | null;
                } | null;
            };
            reported: {
                id: string;
                email: string;
                username: string;
                profile: {
                    displayName: string | null;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            messageId: string | null;
            matchId: string | null;
            reason: string;
            details: string | null;
            status: string;
            reporterId: string;
            reportedId: string;
        })[];
    }>;
    updateReportStatus(auth: string, reportId: string, body: {
        status: string;
    }): Promise<{
        ok: boolean;
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
