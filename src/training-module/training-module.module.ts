import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './entities/training-session.entity';
import { TrainingImage } from './entities/training-image.entity';
import { Annotation } from './entities/annotation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingSession,
      TrainingImage,
      Annotation,
    ]),
  ],
})
export class TrainingModuleModule {}