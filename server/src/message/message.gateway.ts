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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const userId = payload.sub as string;

      (client as any).userId = userId;
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string;
    if (userId) this.userSockets.delete(userId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; content: string },
  ) {
    const userId = (client as any).userId as string;
    if (!userId) return;

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
