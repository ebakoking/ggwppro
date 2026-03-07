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
        read: boolean;
    })[]>;
    sendMessage(matchId: string, req: any, body: {
        content: string;
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
        read: boolean;
    }>;
    markAsRead(matchId: string, req: any): Promise<void>;
}
