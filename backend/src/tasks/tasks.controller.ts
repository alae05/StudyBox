import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query('day') day: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.findByDay(day, +userId);
  }

  @Post()
  createTask(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Put(':id')
  updateTask(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(+id, body);
  }

  @Patch(':id/toggle')
  toggleTask(@Param('id') id: string) {
    return this.tasksService.toggle(+id);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.tasksService.delete(+id);
  }
}
