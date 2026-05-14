import { Controller, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('user/:userId')
  async getDashboard(@Param('userId') userId: string) {
    return this.progressService.getDashboardData(+userId);
  }
}
