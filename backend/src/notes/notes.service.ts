import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private repo: Repository<Note>,
  ) {}

  findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: ['module'],
      order: { updatedAt: 'DESC' },
    });
  }

  findByModule(userId: number, moduleId: number) {
    return this.repo.find({
      where: { userId, moduleId },
      relations: ['module'],
      order: { updatedAt: 'DESC' },
    });
  }

  create(data: Partial<Note>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Note>) {
    await this.repo.update(id, data);
    return this.repo.findOne({
      where: { id },
      relations: ['module'],
    });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
