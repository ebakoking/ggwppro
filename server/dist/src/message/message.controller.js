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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let MessageController = class MessageController {
    messageService;
    constructor(messageService) {
        this.messageService = messageService;
    }
    getMessages(matchId, req, cursor) {
        return this.messageService.getMessages(matchId, req.user.id, cursor);
    }
    sendMessage(matchId, req, body) {
        return this.messageService.sendMessage(matchId, req.user.id, body.content);
    }
    markAsRead(matchId, req) {
        return this.messageService.markAsRead(matchId, req.user.id);
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Get)(':matchId'),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':matchId'),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':matchId/read'),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "markAsRead", null);
exports.MessageController = MessageController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
//# sourceMappingURL=message.controller.js.map