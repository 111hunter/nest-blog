import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { CreateCommentDTO } from 'src/models/comment.models';
import { ArticleEntity } from 'src/entities/article.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentEntity)
        private commentRepo: Repository<CommentEntity>,
        @InjectRepository(ArticleEntity)
        private articleRepo: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
    ) { }

    async findByArticleSlug(slug: string) {
        const article = await this.articleRepo.findOne({ where: { slug } });
        return this.commentRepo.find({
            where: { article: article.id },
        });
    }

    findById(id: number) {
        return this.commentRepo.findOne({ where: { id } });
    }

    async createComment(slug: string, username: string, data: CreateCommentDTO) {
        const article = await this.articleRepo.findOne({ where: { slug } });
        const author = await this.userRepo.findOne({ where: { username } });
        const comment = this.commentRepo.create(data);
        comment.author = author;
        comment.article = article;
        await comment.save();
        return this.commentRepo.findOne({ where: { body: data.body } });
    }

    async deleteComment(user: UserEntity, id: number) {
        const comment = await this.commentRepo.findOne({
            where: { id, author: user.id },
        });
        await comment.remove();
        return comment;
    }
}