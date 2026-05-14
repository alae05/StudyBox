// PATH: backend/src/revision/quiz/dto/create-quiz-question.dto.ts
// src/revision/quiz/dto/create-quiz-question.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizOptionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsInt()
  @Min(0)
  ordre: number;
}

export class CreateQuizQuestionDto {
  @IsInt()
  moduleId: number;

  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  options: CreateQuizOptionDto[];
}
