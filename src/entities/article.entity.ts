import {
    Entity,
    Column,
    BeforeInsert,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    RelationCount,
    JoinTable,
} from 'typeorm';
import { classToPlain } from 'class-transformer';
import * as slugify from 'slug';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';

@Entity('articles')
export class ArticleEntity extends AbstractEntity {
    @Column()
    slug: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    body: string;

    @ManyToMany(
        type => UserEntity,
        user => user.favorites,
        { eager: true },
    )
    @JoinTable()
    favoritedBy: UserEntity[];

    @RelationCount((article: ArticleEntity) => article.favoritedBy)
    favoritesCount: number;

    @ManyToOne(
        type => UserEntity,
        user => user.articles,
        { eager: true },
    )
    author: UserEntity;

    @Column('simple-array')
    tagList: string[];

    @BeforeInsert()
    generateSlug() {
        this.slug =
            slugify(this.title, { lower: true }) +
            '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
    }

    toJSON() {
        return classToPlain(this);
    }

    toArticle(user?: UserEntity) {
        let favorited = false;
        if (user) {
            favorited = this.favoritedBy.map(user => user.id).includes(user.id);
        }
        const article: any = this.toJSON();
        return { ...article, favorited };
    }
}