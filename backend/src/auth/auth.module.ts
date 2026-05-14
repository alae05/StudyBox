import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { VerificationCode } from './VerificationCode.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, VerificationCode])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
