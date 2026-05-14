
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { createReadStream } from 'fs';

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

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('modules/:moduleId/documents')
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Get()
  findAll(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.svc.findByModule(moduleId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Query('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: MulterFile,
  ) {
    return this.svc.create(moduleId, userId, file);
  }

  @Get(':docId/text')
  async extractText(@Param('docId', ParseIntPipe) docId: number) {
    const text = await this.svc.extractText(docId);
    return { text };
  }

  @Get(':docId/file')
  async download(
    @Param('docId', ParseIntPipe) docId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { path, name, mime } = await this.svc.getFilePath(docId);

    const inline = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(mime);

    res.set({
      'Content-Type': mime,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(name)}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    return new StreamableFile(createReadStream(path));
  }

  @Delete(':docId')
  remove(@Param('docId', ParseIntPipe) docId: number) {
    return this.svc.remove(docId);
  }
}