import { MessageService } from './message.service';
export declare class MessageController {
    private messageService;
    constructor(messageService: MessageService);
    getMessages(matchId: string, req: any, cursor?: string): Promise<({
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
    sendMessage(matchId: string, req: any, body: {
        content?: string;
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
    uploadVoice(matchId: string, req: any, file: Express.Multer.File): Promise<{
        audioUrl: string;
    }>;
    markAsRead(matchId: string, req: any): Promise<void>;
}
