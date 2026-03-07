import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.userSockets.delete(userId);
  }

  constructor(private messageService: MessageService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; content: string },
  ) {
    const userId = client.handshake.query.userId as string;
    const message = await this.messageService.sendMessage(
      data.matchId,
      userId,
      data.content,
    );

    this.server.to(`match:${data.matchId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    client.join(`match:${data.matchId}`);
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    client.leave(`match:${data.matchId}`);
  }

  notifyMatch(userAId: string, userBId: string, matchData: any) {
    this.server.to(`user:${userAId}`).emit('newMatch', matchData);
    this.server.to(`user:${userBId}`).emit('newMatch', matchData);
  }
}
