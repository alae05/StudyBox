import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';
import { QuizOption } from './quiz-option.entity';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private quizOptionRepository: Repository<QuizOption>,
  ) {}

  async findByModule(moduleId: number): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { moduleId },
      relations: ['options'],
      order: { id: 'ASC' },
    });
  }

  async create(dto: CreateQuizQuestionDto): Promise<QuizQuestion> {
    const question = this.quizQuestionRepository.create({
      moduleId: dto.moduleId,
      userId: dto.userId,
      question: dto.question,
      explanation: dto.explanation,
    });
    const saved = await this.quizQuestionRepository.save(question);

    if (dto.options && dto.options.length > 0) {
      const options = dto.options.map((opt, index) =>
        this.quizOptionRepository.create({
          questionId: saved.id,
          label: opt.label,
          isCorrect: opt.isCorrect,
          ordre: opt.ordre ?? index,
        }),
      );
      await this.quizOptionRepository.save(options);
    }

    const result = await this.quizQuestionRepository.findOne({
      where: { id: saved.id },
      relations: ['options'],
    });

    if (!result) throw new Error(`QuizQuestion #${saved.id} not found after save`);
    return result;
  }

  async createBulk(dtos: CreateQuizQuestionDto[]): Promise<QuizQuestion[]> {
    return Promise.all(dtos.map((dto) => this.create(dto)));
  }
}