import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    async findByUsername(
        username: string,
        user?: UserEntity,
    ): Promise<UserEntity> {
        return (
            await this.userRepo.findOne({
                where: { username },
                relations: ['followers'],
            })
        ).toProfile(user);
    }

    async followUser(currentUser: UserEntity, username: string) {
        const user = await this.userRepo.findOne({
            where: { username },
            relations: ['followers'],
        });
        let { followed } = user.toProfile(currentUser);
        if (!followed) {
            user.followers.push(currentUser);
            await user.save();
        }
        return { ...user.toJSON(), "followed": true };
    }

    async unfollowUser(currentUser: UserEntity, username: string) {
        const user = await this.userRepo.findOne({
            where: { username },
            relations: ['followers'],
        });
        let { followed } = user.toProfile(currentUser);
        if (followed) {
            user.followers = user.followers.filter(
                follower => follower.username !== currentUser.username
            )
            await user.save();
        }
        return { ...user.toJSON(), "followed": false };
    }
}