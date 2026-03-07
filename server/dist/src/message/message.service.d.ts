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
        messageType: string;
        audioUrl: string | null;
        read: boolean;
    })[]>;
    sendMessage(matchId: string, senderId: string, content: string, opts?: {
        messageType?: string;
        audioUrl?: string;
    }): Promise<{
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
        messageType: string;
        audioUrl: string | null;
        read: boolean;
    }>;
    markAsRead(matchId: string, userId: string): Promise<void>;
    uploadVoice(matchId: string, userId: string, file: Express.Multer.File): Promise<{
        audioUrl: string;
    }>;
}
