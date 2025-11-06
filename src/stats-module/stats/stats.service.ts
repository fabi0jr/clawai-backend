import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Detection } from '../../detection-module/entities/detection.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Detection)
    private detectionsRepository: Repository<Detection>,
  ) {}

  async getDashboardStats() {
    // 1. Calcular Item Separation (Dados Reais)
    const counts = await this.detectionsRepository
      .createQueryBuilder('detection')
      .select('detection.category', 'category')
      .addSelect('COUNT(detection.id)', 'count')
      .groupBy('detection.category')
      .getRawMany();

    // Formata os dados no formato que o frontend espera
    const itemSeparation = {
      categoryA: 0,
      categoryB: 0,
      categoryC: 0,
      unclassified: 0,
    };
    counts.forEach((row) => {
      if (row.category === 'A') itemSeparation.categoryA = parseInt(row.count, 10);
      else if (row.category === 'B') itemSeparation.categoryB = parseInt(row.count, 10);
      else if (row.category === 'C') itemSeparation.categoryC = parseInt(row.count, 10);
      else itemSeparation.unclassified = parseInt(row.count, 10);
    });

    // 2. Performance (Mocado por enquanto)
    const performance = {
      classificationRate: 98.9, // Valor estático por enquanto
      processingSpeed: 32,      // Valor estático por enquanto
    };

    // 3. System Status (Mocado por enquanto)
    const systemStatus = {
      aiModel: 'online',
      cameraFeed: 'active',
      dataStorage: 78, // Valor estático por enquanto
    };

    return {
      itemSeparation,
      performance,
      systemStatus,
    };
  }
}