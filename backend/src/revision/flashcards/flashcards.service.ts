import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from './flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly repo: Repository<Flashcard>,
  ) {}

  create(dto: CreateFlashcardDto): Promise<Flashcard> {
    const card = this.repo.create(dto);
    return this.repo.save(card);
  }

  /** All flashcards for a given module, optionally filtered by tag */
  findByModule(moduleId: number, tag?: string): Promise<Flashcard[]> {
    const qb = this.repo
      .createQueryBuilder('fc')
      .where('fc.moduleId = :moduleId', { moduleId });

    if (tag) qb.andWhere('fc.tag = :tag', { tag });

    return qb.orderBy('fc.createdAt', 'DESC').getMany();
  }

  /** All flashcards owned by a user (across modules) */
  findByUser(userId: number): Promise<Flashcard[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Flashcard> {
    const card = await this.repo.findOne({ where: { id } });
    if (!card) throw new NotFoundException(`Flashcard #${id} not found`);
    return card;
  }

  async update(id: number, dto: UpdateFlashcardDto): Promise<Flashcard> {
    const card = await this.findOne(id);
    Object.assign(card, dto);
    return this.repo.save(card);
  }

  async remove(id: number): Promise<void> {
    const card = await this.findOne(id);
    await this.repo.remove(card);
  }
}
