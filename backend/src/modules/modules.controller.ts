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
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.modulesService.findAll(Number(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any) {
    return this.modulesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.modulesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(Number(id));
  }


  @Put(':id/notes')
  updateNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.modulesService.updateNotes(Number(id), notes);
  }
}
