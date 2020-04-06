import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    async findByUsername(username: string) {
        return await this.userRepo.findOne({
            where: { username },
            relations: ['followers'],
        });
    }

    async followUser(currentUser: UserEntity, username: string) {
        const user = await this.findByUsername(username);
        let { followed } = user.toProfile(currentUser);
        if (!followed) {
            user.followers.push(currentUser);
            await user.save();
            followed = true;
        }
        delete user.followers;
        return { user, followed };
    }

    async unfollowUser(currentUser: UserEntity, username: string) {
        const user = await this.findByUsername(username);
        let { followed } = user.toProfile(currentUser);
        if (followed) {
            user.followers = user.followers.filter(
                follower => follower.id !== currentUser.id
            )
            await user.save();
            followed = false;
        }
        delete user.followers;
        return { user, followed };
    }
}