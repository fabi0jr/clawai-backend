import { Module } from '@nestjs/common';
import { StatsService } from './stats/stats.service';
import { StatsController } from './stats/stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detection } from '../detection-module/entities/detection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Detection]), // Importa a entidade Detection
  ],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModuleModule {}