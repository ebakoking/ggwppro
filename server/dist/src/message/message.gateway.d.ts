import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
export declare class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messageService;
    server: Server;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    constructor(messageService: MessageService);
    handleMessage(client: Socket, data: {
        matchId: string;
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
        messageType: string;
        audioUrl: string | null;
        read: boolean;
    }>;
    handleJoinMatch(client: Socket, data: {
        matchId: string;
    }): void;
    handleLeaveMatch(client: Socket, data: {
        matchId: string;
    }): void;
    notifyMatch(userAId: string, userBId: string, matchData: any): void;
}
