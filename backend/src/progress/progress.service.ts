import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';

interface ModuleProgressRow {
  id: number;
  nom: string;
  couleur: string | null;
  semester: string | null;
  progress: number | string | null;
  totalMinutes: number | string | null;
  quizzes: number | string | null;
}

interface WeeklyRow {
  day: string;
  minutes: number | string | null;
}

interface UserStreakRow {
  streak: number | string | null;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Goal) private goalRepo: Repository<Goal>,
    private dataSource: DataSource,
  ) {}

  async getDashboardData(userId: number) {
    const modules = await this.dataSource.query<ModuleProgressRow[]>(
  `SELECT
     m.id,
     m.nom,
     m.couleur,
     m.semester,
     m.progress,
     COALESCE(ts_agg.totalMinutes, 0) AS totalMinutes,
     COALESCE(qq_agg.quizzes, 0)      AS quizzes
   FROM modules m

   LEFT JOIN (
     SELECT moduleId, SUM(CASE WHEN terminee = 1 THEN dureeReelleMinutes ELSE 0 END) AS totalMinutes
     FROM timer_sessions
     
     GROUP BY moduleId
   ) ts_agg ON ts_agg.moduleId = m.id

   LEFT JOIN (
     SELECT moduleId, COUNT(DISTINCT id) AS quizzes
     FROM quiz_questions
     GROUP BY moduleId
   ) qq_agg ON qq_agg.moduleId = m.id

   WHERE m.userId = ?
   ORDER BY m.lastActivity DESC`,
  [userId],
);

    const goals = await this.goalRepo.find({ where: { userId } });

    const weeklyRaw = await this.dataSource.query<WeeklyRow[]>(
      `SELECT DATE(createdAt) AS day, SUM(dureeReelleMinutes) AS minutes
       FROM timer_sessions
       WHERE userId = ? AND terminee = 1
         AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(createdAt)`,
      [userId],
    );

    const weeklyMap = new Map<string, number>();
    for (const row of weeklyRaw) {
      weeklyMap.set(String(row.day).slice(0, 10), Number(row.minutes ?? 0));
    }

    const weeklyData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      weeklyData.push(Math.round((weeklyMap.get(key) ?? 0) / 60));
    }

    const streakRows = await this.dataSource.query<UserStreakRow[]>(
      'SELECT streak FROM users WHERE id = ? LIMIT 1',
      [userId],
    );

    return {
      moduleProgress: modules.map((module) => {
        const totalMinutes = Number(module.totalMinutes ?? 0);
        return {
          id: module.id,
          name: module.nom,
          color: module.couleur || '#3b82f6',
          semester: module.semester ?? '',
          progress: Number(module.progress ?? 0),
          hours: Math.round((totalMinutes / 60) * 10) / 10,
          quizzes: Number(module.quizzes ?? 0),
          score: 0,
        };
      }),
      weeklyData,
      goals: goals.map((goal) => ({
        ...goal,
        progress: goal.currentProgress,
        target: new Date(goal.targetDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        current: `${goal.currentProgress}%`,
      })),
      streak: Number(streakRows[0]?.streak ?? 0),
    };
  }
}
