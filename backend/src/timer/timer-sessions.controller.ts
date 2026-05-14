import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TimerSessionsService } from './timer-sessions.service';

@Controller('timer-sessions')
export class TimerSessionsController {
  constructor(private readonly svc: TimerSessionsService) {}

  @Post()
  create(
    @Body()
    body: {
      userId: number;
      moduleId?: number | null;
      dureeMinutes: number;
      sujet?: string;
    },
  ) {
    return this.svc.create(body);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.svc.findByUser(Number(userId));
  }
}
