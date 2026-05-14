import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TimerSession } from './timer-session.entity';

@Injectable()
export class TimerSessionsService {
  constructor(
    @InjectRepository(TimerSession)
    private repo: Repository<TimerSession>,
    private dataSource: DataSource,
  ) {}

  async create(body: {
    userId: number;
    moduleId?: number | null;
    dureeMinutes: number;
    sujet?: string;
  }) {
    const session = this.repo.create({
      userId: body.userId,
      moduleId: body.moduleId ?? null,
      dureeMinutes: body.dureeMinutes,
      dureeReelleMinutes: body.dureeMinutes,
      terminee: true,
      sujet: body.sujet ?? "Session d'étude",
    });
    await this.repo.save(session);

    if (body.moduleId) {
      await this.dataSource.query(
        `UPDATE modules
         SET totalHours = (
           SELECT COALESCE(SUM(dureeReelleMinutes), 0)
           FROM timer_sessions
           WHERE moduleId = ? AND terminee = 1
         )
         WHERE id = ?`,
        [body.moduleId, body.moduleId],
      );
    }

    return { success: true };
  }

  async findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
