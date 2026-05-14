import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizQuestion } from './quiz-question.entity';
import { QuizOption } from './quiz-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, QuizOption])],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
