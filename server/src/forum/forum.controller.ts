import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forum')
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private forumService: ForumService) {}

  @Get()
  getPosts(
    @Query('gameId') gameId?: string,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.forumService.getPosts(gameId, parseInt(limit, 10), cursor);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.forumService.getPost(id);
  }

  @Post()
  createPost(
    @Req() req: any,
    @Body()
    body: { gameId: string; title: string; content: string; linkUrl?: string },
  ) {
    return this.forumService.createPost(req.user.id, body);
  }

  @Post(':id/comment')
  addComment(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: { content: string },
  ) {
    return this.forumService.addComment(postId, req.user.id, body.content);
  }

  @Post(':id/like')
  toggleLike(@Req() req: any, @Param('id') postId: string) {
    return this.forumService.toggleLike(postId, req.user.id);
  }

  @Post(':id/report')
  reportPost(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: { reason: string },
  ) {
    return this.forumService.reportPost(postId, req.user.id, body.reason);
  }

  @Delete(':id')
  deletePost(@Req() req: any, @Param('id') postId: string) {
    return this.forumService.deletePost(postId, req.user.id);
  }
}
