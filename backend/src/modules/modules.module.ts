import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { StudyModule } from './module.entity';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyModule]),
    DocumentsModule, 
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
