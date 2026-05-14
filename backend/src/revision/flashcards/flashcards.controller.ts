import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@Controller('revision/flashcards')
export class FlashcardsController {
  constructor(private readonly service: FlashcardsService) {}

  @Post()
  create(@Body() dto: CreateFlashcardDto) {
    return this.service.create(dto);
  }

  @Get('module/:moduleId')
  findByModule(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Query('tag') tag?: string,
  ) {
    return this.service.findByModule(moduleId, tag);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlashcardDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
