import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
    providers: [UserService],
    controllers: [ProfileController],
})
export class UserModule { }