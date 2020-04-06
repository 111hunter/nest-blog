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
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/entities/user.entity';
import { CreateArticleDTO, UpdateArticleDTO } from 'src/models/article.models';
import { User } from 'src/user/user.decorator';

@Controller('articles')
export class ArticleController {
    constructor(private articleService: ArticleService) { }

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
}