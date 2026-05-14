import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerSessionsController } from './timer-sessions.controller';
import { TimerSessionsService } from './timer-sessions.service';
import { TimerSession } from './timer-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimerSession])],
  controllers: [TimerSessionsController],
  providers: [TimerSessionsService],
  exports: [TimerSessionsService],
})
export class TimerSessionsModule {}
