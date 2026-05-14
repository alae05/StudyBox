
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { extname } from 'path';
import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as mammoth from 'mammoth';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

function toReact(doc: Document) {
  return {
    id: doc.id,
    name: doc.nomOriginal,
    size: doc.taille,
    type: doc.extension.toUpperCase(),
    date: new Date(doc.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private repo: Repository<Document>,
  ) {}

  async findByModule(moduleId: number) {
    const docs = await this.repo.find({ where: { moduleId } });
    return docs.map(toReact);
  }

  async create(moduleId: number, userId: number, file: MulterFile) {
    const ext = extname(file.originalname).replace('.', '').toLowerCase();
    const doc = this.repo.create({
      moduleId,
      userId,
      nomOriginal: file.originalname,
      nomFichier: file.filename,
      extension: ext,
      typeMime: file.mimetype,
      taille: file.size,
      chemin: file.path,
    });
    const saved = await this.repo.save(doc);
    return toReact(saved);
  }

  async getFilePath(docId: number): Promise<{ path: string; name: string; mime: string }> {
    const doc = await this.repo.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException(`Document ${docId} introuvable`);
    if (!fs.existsSync(doc.chemin)) throw new NotFoundException('Fichier introuvable sur le serveur');
    return { path: doc.chemin, name: doc.nomOriginal, mime: doc.typeMime };
  }

  async remove(docId: number) {
    const doc = await this.repo.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException(`Document ${docId} introuvable`);
    if (fs.existsSync(doc.chemin)) fs.unlinkSync(doc.chemin);
    await this.repo.remove(doc);
    return { message: 'Document supprimé' };
  }

  async extractText(docId: number): Promise<string> {
    const doc = await this.repo.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException(`Document ${docId} introuvable`);
    if (!fs.existsSync(doc.chemin)) throw new NotFoundException('Fichier introuvable sur le serveur');

    const ext = doc.extension.toLowerCase();
    const buffer = fs.readFileSync(doc.chemin);

    if (ext === 'pdf') {
      const uint8 = new Uint8Array(buffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item: any) => item.str).join(' '));
      }
      return pages.join('\n').slice(0, 4000);
    }

    if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.slice(0, 4000);
    }

    if (ext === 'txt') {
      return buffer.toString('utf-8').slice(0, 4000);
    }

    return `[Format .${ext} non supporté pour l'extraction — fichier: ${doc.nomOriginal}]`;
  }
}