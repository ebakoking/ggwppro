"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const message_service_1 = require("./message.service");
let MessageGateway = class MessageGateway {
    messageService;
    server;
    userSockets = new Map();
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            this.userSockets.set(userId, client.id);
            client.join(`user:${userId}`);
        }
    }
    handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId)
            this.userSockets.delete(userId);
    }
    constructor(messageService) {
        this.messageService = messageService;
    }
    async handleMessage(client, data) {
        const userId = client.handshake.query.userId;
        const message = await this.messageService.sendMessage(data.matchId, userId, data.content);
        this.server.to(`match:${data.matchId}`).emit('newMessage', message);
        return message;
    }
    handleJoinMatch(client, data) {
        client.join(`match:${data.matchId}`);
    }
    handleLeaveMatch(client, data) {
        client.leave(`match:${data.matchId}`);
    }
    notifyMatch(userAId, userBId, matchData) {
        this.server.to(`user:${userAId}`).emit('newMatch', matchData);
        this.server.to(`user:${userBId}`).emit('newMatch', matchData);
    }
};
exports.MessageGateway = MessageGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessageGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessageGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinMatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessageGateway.prototype, "handleJoinMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveMatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessageGateway.prototype, "handleLeaveMatch", null);
exports.MessageGateway = MessageGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageGateway);
//# sourceMappingURL=message.gateway.js.map