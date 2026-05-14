import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const match = req.url.match(/\/modules\/(\d+)\/documents/);
          const moduleId = match ? match[1] : 'tmp';
          const dir = join(process.cwd(), 'uploads', moduleId);
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuid()}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
