import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { StudySession } from './entities/study-session.entity';
import { Goal } from './entities/goal.entity';
@Module({
  imports: [TypeOrmModule.forFeature([StudySession, Goal])], // ONLY what you actually have
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
