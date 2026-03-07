import { PrismaService } from '../prisma/prisma.service';
export declare class MessageService {
    private prisma;
    constructor(prisma: PrismaService);
    getMessages(matchId: string, userId: string, cursor?: string): Promise<({
        sender: {
            id: string;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        matchId: string;
        senderId: string;
        content: string;
        read: boolean;
    })[]>;
    sendMessage(matchId: string, senderId: string, content: string): Promise<{
        sender: {
            id: string;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        matchId: string;
        senderId: string;
        content: string;
        read: boolean;
    }>;
    markAsRead(matchId: string, userId: string): Promise<void>;
}
