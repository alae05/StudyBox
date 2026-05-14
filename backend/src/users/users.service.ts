import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const MODULE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#ec4899',
];

function computeBadges(
  streak: number,
  moduleCount: number,
  maxProgress: number,
  docCount: number,
) {
  const badges: { label: string; color: string }[] = [];
  if (streak >= 3)
    badges.push({ label: `Série de ${streak}j`, color: '#f97316' });
  if (moduleCount >= 3)
    badges.push({ label: `${moduleCount} Modules`, color: '#8b5cf6' });
  if (maxProgress >= 80)
    badges.push({ label: `${maxProgress}% Module`, color: '#10b981' });
  if (docCount >= 5) badges.push({ label: 'Bibliothèque', color: '#3b82f6' });
  if (docCount >= 1) badges.push({ label: 'Premier Doc', color: '#f59e0b' });
  if (badges.length === 0) badges.push({ label: 'Débutant', color: '#64748b' });
  return badges;
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async updateStreak(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const todayStr = today.toDateString();
    const lastActiveStr = lastActive ? lastActive.toDateString() : null;
    if (lastActiveStr === todayStr) return;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    user.streak =
      lastActiveStr === yesterday.toDateString() ? user.streak + 1 : 1;
    user.lastActive = new Date();
    await this.usersRepository.save(user);
  }

  async create(nomComplet: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      nom: nomComplet,
      email,
      motDePasse: hash,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getProfile(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);

    const modules: Array<{
      id: number;
      nom: string;
      progress: number;
      couleur: string;
      docCount: string;
      lastActivity: string;
      totalHours: number;
    }> = await this.dataSource.query(
      `SELECT m.id, m.nom, m.progress, m.couleur, m.lastActivity, m.totalHours,
              COUNT(d.id) AS docCount
       FROM modules m
       LEFT JOIN documents d ON d.moduleId = m.id
       WHERE m.userId = ?
       GROUP BY m.id
       ORDER BY m.lastActivity DESC`,
      [id],
    );

    const [{ totalDocs }] = await this.dataSource.query(
      `SELECT COUNT(*) AS totalDocs FROM documents WHERE userId = ?`,
      [id],
    );

    const totalMinutes = modules.reduce(
      (sum, m) => sum + Number(m.totalHours ?? 0),
      0,
    );
    const heuresLabel = formatDuration(totalMinutes);

    const avgProgress =
      modules.length > 0
        ? Math.round(
            modules.reduce((s, m) => s + Number(m.progress), 0) /
              modules.length,
          )
        : 0;

    const recentDocs: Array<{
      nomOriginal: string;
      moduleName: string;
      createdAt: Date;
    }> = await this.dataSource.query(
      `SELECT d.nomOriginal, m.nom AS moduleName, d.createdAt
         FROM documents d
         JOIN modules m ON m.id = d.moduleId
         WHERE d.userId = ?
         ORDER BY d.createdAt DESC LIMIT 5`,
      [id],
    );

    const recentActivity = recentDocs.map((d) => ({
      text: `Document ajouté dans ${d.moduleName} — ${d.nomOriginal}`,
      time: relativeTime(new Date(d.createdAt)),
    }));

    if (recentActivity.length === 0) {
      recentActivity.push({
        text: 'Compte créé avec succès',
        time: relativeTime(new Date(user.createdAt)),
      });
    }

    const heatmapRaw: Array<{ day: string; minutes: number }> =
      await this.dataSource.query(
        `SELECT DATE(createdAt) AS day, SUM(dureeReelleMinutes) AS minutes
       FROM timer_sessions
       WHERE userId = ? AND terminee = 1
         AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 27 DAY)
       GROUP BY DATE(createdAt)`,
        [id],
      );

    const heatmapMap = new Map<string, number>();
    for (const row of heatmapRaw) heatmapMap.set(row.day, Number(row.minutes));

    const heatmap: number[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      heatmap.push(heatmapMap.get(d.toISOString().slice(0, 10)) ?? 0);
    }

    const maxProgress =
      modules.length > 0
        ? Math.max(...modules.map((m) => Number(m.progress)))
        : 0;

    const badges = computeBadges(
      user.streak,
      modules.length,
      maxProgress,
      Number(totalDocs),
    );

    const joinDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });

    return {
      id: user.id,
      name: user.nom,
      email: user.email,
      initials: user.nom
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase(),
      level: user.niveau,
      school: user.ecole,
      joinDate,
      streak: user.streak,
      stats: {
        modules: modules.length,
        documents: Number(totalDocs),
        heures: heuresLabel, 
        progression: avgProgress,
      },
      modulesProgress: modules.map((m, i) => ({
        name: m.nom,
        progress: Number(m.progress),
        color: m.couleur || MODULE_COLORS[i % MODULE_COLORS.length],
        docs: Number(m.docCount),
        totalMinutes: Number(m.totalHours ?? 0),
      })),
      recentActivity,
      badges,
      heatmap,
    };
  }

  async update(id: number, body: any) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);

    if (body.name) user.nom = body.name;
    if (body.email) user.email = body.email;
    if (body.level) user.niveau = body.level;
    if (body.school) user.ecole = body.school;

    await this.usersRepository.save(user);
    return {
      id: user.id,
      name: user.nom,
      email: user.email,
      level: user.niveau,
      school: user.ecole,
      initials: user.nom
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase(),
    };
  }
}