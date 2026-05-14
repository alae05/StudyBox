import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyModule } from './module.entity';
import { DocumentsService } from '../documents/documents.service';

function toReact(mod: StudyModule, docs: any[] = []) {
  return {
    id: mod.id,
    userId: mod.userId,
    phaseId: mod.phaseId,
    name: mod.nom,
    color: mod.couleur,
    icone: mod.icone,
    description: mod.description ?? '',
    category: mod.category ?? 'Autre',
    semester: mod.semester ?? '',
    progress: mod.progress ?? 0,
    totalHours: mod.totalHours ?? 0,
    lastActivity: mod.lastActivity ?? '',
    notes: mod.notes ?? '',
    docs, 
    createdAt: mod.createdAt
      ? new Date(mod.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '',
  };
}

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(StudyModule)
    private modulesRepository: Repository<StudyModule>,
    private readonly documentsService: DocumentsService,
  ) {}

  async findAll(userId: number) {
    const mods = await this.modulesRepository.find({ where: { userId } });
    const results = await Promise.all(
      mods.map(async (mod) => {
        const docs = await this.documentsService.findByModule(mod.id);
        return toReact(mod, docs);
      }),
    );
    return results;
  }

  async findOne(id: number) {
    const mod = await this.modulesRepository.findOne({ where: { id } });
    if (!mod) throw new NotFoundException(`Module ${id} introuvable`);
    const docs = await this.documentsService.findByModule(id);
    return toReact(mod, docs);
  }

  private async findEntity(id: number) {
    const mod = await this.modulesRepository.findOne({ where: { id } });
    if (!mod) throw new NotFoundException(`Module ${id} introuvable`);
    return mod;
  }

  async create(body: any) {
    const newMod = this.modulesRepository.create({
      userId: body.userId,
      phaseId: body.phaseId ?? null,
      nom: body.name ?? body.nom,
      icone: body.icone ?? 'calculator',
      couleur: body.color ?? body.couleur ?? '#06b6d4',
      description: body.description ?? '',
      category: body.category ?? 'Autre',
      semester: body.semester ?? '',
      progress: 0,
      totalHours: 0,
      notes: '',
    });
    const saved = await this.modulesRepository.save(newMod);
    return toReact(saved, []);
  }

  async update(id: number, body: any) {
    const mod = await this.findEntity(id);
    if (body.name !== undefined) mod.nom = body.name;
    if (body.color !== undefined) mod.couleur = body.color;
    if (body.icone !== undefined) mod.icone = body.icone;
    if (body.description !== undefined) mod.description = body.description;
    if (body.category !== undefined) mod.category = body.category;
    if (body.semester !== undefined) mod.semester = body.semester;
    if (body.progress !== undefined) mod.progress = body.progress;
    if (body.notes !== undefined) mod.notes = body.notes;
    const saved = await this.modulesRepository.save(mod);
    const docs = await this.documentsService.findByModule(id);
    return toReact(saved, docs);
  }

  async remove(id: number) {
    const mod = await this.findEntity(id);
    await this.modulesRepository.remove(mod);
    return { message: 'Module supprimé avec succès' };
  }

  async updateNotes(id: number, notes: string) {
    const mod = await this.findEntity(id);
    mod.notes = notes;
    await this.modulesRepository.save(mod);
    return { notes };
  }
}
