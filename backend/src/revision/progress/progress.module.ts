import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardProgress } from './card-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardProgress])],
  controllers: [],
  providers: [],
})
export class ProgressModule {}
