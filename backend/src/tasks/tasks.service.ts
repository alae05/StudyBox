import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  findByDay(dayKey: string, userId: number): Promise<Task[]> {
    return this.repo.find({
      where: { dayKey, userId },
      relations: ['module'],
    });
  }

  create(data: Partial<Task>): Promise<Task> {
    const task = this.repo.create(data);
    return this.repo.save(task);
  }

  async update(id: number, data: Partial<Task>): Promise<Task | null> {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id }, relations: ['module'] });
  }

  async toggle(id: number) {
    const task = await this.repo.findOne({
      where: { id },
      relations: ['module'],
    });
    if (!task) return;
    task.done = !task.done;
    return this.repo.save(task);
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}
