import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats') // Rota /stats
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getDashboardStats();
  }
}