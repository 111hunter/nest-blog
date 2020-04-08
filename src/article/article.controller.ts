import {
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
    Body,
    ValidationPipe,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/entities/user.entity';
import { CreateArticleDTO, UpdateArticleDTO, FindAllQuery, FindFeedQuery } from 'src/models/article.models';
import { User } from 'src/user/user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDTO } from 'src/models/comment.models';

@Controller('articles')
export class ArticleController {
    constructor(
        private articleService: ArticleService,
        private commentService: CommentsService,
    ) { }

    @Get()
    async findAll(@User() user: UserEntity, @Query() query: FindAllQuery) {
        const articles = await this.articleService.findAll(user, query);
        return { articles, articlesCount: articles.length };
    }

    @Get('/feed')
    @UseGuards(AuthGuard())
    async findFeed(@User() user: UserEntity, @Query() query: FindFeedQuery) {
        const articles = await this.articleService.findFeed(user, query);
        return { articles, articlesCount: articles.length };
    }

    @Get('/:slug')
    async findBySlug(@Param('slug') slug: string, @User() user: UserEntity) {
        const article = await this.articleService.findBySlug(slug);
        return { article };
    }

    @Post()
    @UseGuards(AuthGuard())
    async createArticle(
        @User() user: UserEntity,
        @Body(ValidationPipe) data: { article: CreateArticleDTO },
    ) {
        const article = await this.articleService.createArticle(user, data.article);
        return { article };
    }

    @Put('/:slug')
    @UseGuards(AuthGuard())
    async updateArticle(
        @Param('slug') slug: string,
        @User() user: UserEntity,
        @Body(ValidationPipe) data: { article: UpdateArticleDTO },
    ) {
        const article = await this.articleService.updateArticle(slug, user, data.article);
        return { article };
    }

    @Delete('/:slug')
    @UseGuards(AuthGuard())
    async deleteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        return await this.articleService.deleteArticle(slug, user);
    }

    @Post('/:slug/favorite')
    @UseGuards(AuthGuard())
    async favoriteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        const article = await this.articleService.favoriteArticle(slug, user);
        return { article };
    }

    @Delete('/:slug/favorite')
    @UseGuards(AuthGuard())
    async unfavoriteArticle(
        @Param('slug') slug: string,
        @User() user: UserEntity,
    ) {
        const article = await this.articleService.unfavoriteArticle(slug, user);
        return { article };
    }

    @Get('/:slug/comments')
    async findComments(@Param('slug') slug: string) {
        const comments = await this.commentService.findByArticleSlug(slug);
        return { comments };
    }

    @Post('/:slug/comments')
    @UseGuards(AuthGuard())
    async createComment(
        @Param('slug') slug: string,
        @User() { username }: UserEntity,
        @Body(ValidationPipe) data: { comment: CreateCommentDTO },
    ) {
        const comment = await this.commentService.createComment(slug, username, data.comment);
        return { comment };
    }

    @Delete('/:slug/comments/:id')
    @UseGuards(AuthGuard())
    async deleteComment(@User() user: UserEntity, @Param('id') id: number) {
        const comment = await this.commentService.deleteComment(user, id);
        return { comment };
    }
}