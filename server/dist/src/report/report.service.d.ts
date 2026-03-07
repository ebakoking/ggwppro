import { PrismaService } from '../prisma/prisma.service';
export declare class ReportService {
    private prisma;
    constructor(prisma: PrismaService);
    create(reporterId: string, reportedId: string, reason: string, details?: string, matchId?: string, messageId?: string): Promise<{
        id: string;
        createdAt: Date;
        messageId: string | null;
        matchId: string | null;
        reason: string;
        details: string | null;
        status: string;
        reporterId: string;
        reportedId: string;
    }>;
    listForAdmin(status?: string): Promise<({
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
    })[]>;
    updateStatus(reportId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        messageId: string | null;
        matchId: string | null;
        reason: string;
        details: string | null;
        status: string;
        reporterId: string;
        reportedId: string;
    }>;
}
