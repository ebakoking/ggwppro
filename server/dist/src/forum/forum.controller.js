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
exports.ForumController = void 0;
const common_1 = require("@nestjs/common");
const forum_service_1 = require("./forum.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ForumController = class ForumController {
    forumService;
    constructor(forumService) {
        this.forumService = forumService;
    }
    getPosts(gameId, limit = '20', cursor) {
        return this.forumService.getPosts(gameId, parseInt(limit, 10), cursor);
    }
    getPost(id) {
        return this.forumService.getPost(id);
    }
    createPost(req, body) {
        return this.forumService.createPost(req.user.id, body);
    }
    addComment(req, postId, body) {
        return this.forumService.addComment(postId, req.user.id, body.content);
    }
    toggleLike(req, postId) {
        return this.forumService.toggleLike(postId, req.user.id);
    }
};
exports.ForumController = ForumController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('gameId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "getPost", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "createPost", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "toggleLike", null);
exports.ForumController = ForumController = __decorate([
    (0, common_1.Controller)('forum'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [forum_service_1.ForumService])
], ForumController);
//# sourceMappingURL=forum.controller.js.map