import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private service: NotesService) {}

  @Get()
  getAll(@Query('userId') userId: string) {
    return this.service.findByUser(+userId);
  }

  @Get('module/:moduleId')
  getByModule(
    @Param('moduleId') moduleId: string,
    @Query('userId') userId: string,
  ) {
    return this.service.findByModule(+userId, +moduleId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
