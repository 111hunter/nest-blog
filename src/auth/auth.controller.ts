import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, UpdateUserDTO } from '../models/user.model';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.decorator';
import { UserEntity } from 'src/entities/user.entity';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('users')
    register(@Body(ValidationPipe) credentials: { user: RegisterDTO }) {
        return this.authService.register(credentials.user);
    }

    @Post('users/login')
    login(@Body(ValidationPipe) credentials: { user: LoginDTO }) {
        return this.authService.login(credentials.user);
    }

    @Get('user')
    @UseGuards(AuthGuard())
    findCurrentUser(@User() { username }: UserEntity) {
        return this.authService.findCurrentUser(username);
    }

    @Put('user')
    @UseGuards(AuthGuard())
    update(
        @User() { username }: UserEntity,
        @Body(new ValidationPipe({ transform: true, whitelist: true }))
        data: { user: UpdateUserDTO },
    ) {
        return this.authService.updateUser(username, data.user);
    }
}