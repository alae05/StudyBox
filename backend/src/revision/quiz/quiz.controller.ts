import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';

@Controller('revision/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('module/:moduleId')
  async getByModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.quizService.findByModule(moduleId);
  }

  // POST /revision/quiz — save a single AI-generated question
  @Post()
  async create(@Body() dto: CreateQuizQuestionDto) {
    return this.quizService.create(dto);
  }

  // POST /revision/quiz/bulk — save multiple questions at once
  @Post('bulk')
  async createBulk(@Body() body: { questions: CreateQuizQuestionDto[] }) {
    return this.quizService.createBulk(body.questions);
  }
}