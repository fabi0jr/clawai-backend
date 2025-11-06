import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DetectionModuleModule } from './detection-module/detection-module.module';
import { TrainingModuleModule } from './training-module/training-module.module';
import { StatsModuleModule } from './stats-module/stats-module.module';
import { AppModuleModule } from './core-module/app-module/app-module.module';

@Module({
  imports: [DetectionModuleModule, TrainingModuleModule, StatsModuleModule, AppModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
