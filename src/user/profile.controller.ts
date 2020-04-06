import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Post,
    Delete,
    UseGuards,
    HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.decorator';

@Controller('profiles')
export class ProfileController {
    constructor(private userService: UserService) { }

    @Get('/:username')
    async findProfile(
        @Param('username') username: string,
    ) {
        const profile = await this.userService.findByUsername(username);
        return { profile };
    }

    @Post('/:username/follow')
    @HttpCode(200)
    @UseGuards(AuthGuard())
    async followUser(
        @User() user: UserEntity,
        @Param('username') username: string,
    ) {
        const profile = await this.userService.followUser(user, username);
        return { profile };
    }

    @Delete('/:username/follow')
    @UseGuards(AuthGuard())
    async unfollowUser(
        @User() user: UserEntity,
        @Param('username') username: string,
    ) {
        const profile = await this.userService.unfollowUser(user, username);
        return { profile };
    }
}