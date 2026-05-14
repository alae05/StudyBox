import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFlashcardDto {
  @IsInt()
  moduleId: number;

  @IsInt()
  userId: number;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  tag?: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  hint?: string;
}
