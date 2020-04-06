import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CreateArticleDTO, UpdateArticleDTO } from 'src/models/article.models';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepo: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    findBySlug(slug: string) {
        return this.articleRepo.findOne({
            where: { slug },
        });
    }

    private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
        return article.author.id === user.id;
    }

    async createArticle(user: UserEntity, data: CreateArticleDTO) {
        let article = this.articleRepo.create(data);
        article.author = user;
        const { slug } = await article.save();
        article = await this.findBySlug(slug);
        return { article };
    }

    async updateArticle(slug: string, user: UserEntity, data: UpdateArticleDTO) {
        let article = await this.findBySlug(slug);
        if (!this.ensureOwnership(user, article)) {
            throw new UnauthorizedException();
        }
        await this.articleRepo.update({ slug }, data);
        article = await this.findBySlug(slug);
        return { article };
    }

    async deleteArticle(slug: string, user: UserEntity) {
        const article = await this.findBySlug(slug);
        if (!this.ensureOwnership(user, article)) {
            throw new UnauthorizedException();
        }
        return await this.articleRepo.remove(article);
    }

    async favoriteArticle(slug: string, user: UserEntity) {
        const article = await this.findBySlug(slug);
        let { favorited } = await article.toArticle(user);
        if (!favorited) {
            article.favoritedBy.push(user);
            article.favoritesCount++;
            await article.save();
            favorited = true;
        }
        delete article.favoritedBy;
        return { article: { ...article, favorited } };
    }

    async unfavoriteArticle(slug: string, user: UserEntity) {
        const article = await this.findBySlug(slug);
        let { favorited } = await article.toArticle(user);
        if (favorited) {
            article.favoritedBy = article.favoritedBy.filter(fav => fav.id !== user.id);
            article.favoritesCount--;
            await article.save();
            favorited = false;
        }
        delete article.favoritedBy;
        return { article: { ...article, favorited } };
    }
}