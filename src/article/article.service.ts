import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';
import {
    CreateArticleDTO,
    UpdateArticleDTO,
    FindAllQuery,
    FindFeedQuery,
} from 'src/models/article.models';
import { TagEntity } from 'src/entities/tag.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepo: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(TagEntity) private tagRepo: Repository<TagEntity>,
    ) { }

    private async upsertTags(tagList: string[]) {
        const foundTags = await this.tagRepo.find({
            where: tagList.map(t => ({ tag: t })),
        });
        const newTags = tagList.filter(t => !foundTags.map(t => t.tag).includes(t));
        await Promise.all(
            this.tagRepo.create(newTags.map(t => ({ tag: t }))).map(t => t.save()),
        );
    }

    async findAll(user: UserEntity, query: FindAllQuery) {
        let findOptions: any = {
            where: {},
            order: { "updated": "DESC" },
        };
        if (query.author) {
            const author = await this.userRepo.findOne({ username: query.author });
            findOptions.where.author = author.id;  //外键 authorId
        }
        if (query.favorited) {
            const user = await this.userRepo.findOne({ username: query.favorited });
            const artcles = await this.articleRepo.find(findOptions);
            let ids = artcles.map(artcle => artcle.toFavorite(user))
                .filter(el => el !== undefined);
            findOptions.where.id = In(ids);
        }
        if (query.tag) {
            findOptions.where.tagList = Like(`%${query.tag}%`);
        }
        if (query.limit) {
            findOptions.take = query.limit;
        }
        if (query.offset) {
            findOptions.skip = query.offset;
        }
        return (await this.articleRepo.find(findOptions)).map(article =>
            article.toArticle(user),
        );
    }

    async findFeed(user: UserEntity, query: FindFeedQuery) {
        const { following } = await this.userRepo.findOne({
            where: { id: user.id },
            relations: ['following'],
        });
        const findOptions = {
            ...query,
            where: following.map(follow => ({ author: follow.id })),
        };
        return (await this.articleRepo.find(findOptions)).map(article =>
            article.toArticle(user),
        );
    }

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
        await this.upsertTags(data.tagList);
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