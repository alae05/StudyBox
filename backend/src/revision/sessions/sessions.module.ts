import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisionSession } from './revision-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RevisionSession])],
  controllers: [],
  providers: [],
})
export class SessionsModule {}
