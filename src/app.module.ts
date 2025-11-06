import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionModuleModule } from './detection-module/detection-module.module';
import { TrainingModuleModule } from './training-module/training-module.module';
import { StatsModuleModule } from './stats-module/stats-module.module';
import { AppModuleModule } from './core-module/app-module/app-module.module';

@Module({
  imports: [
    // 1. Carrega as variáveis de ambiente (do .env) para todo o app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Configura a conexão com o banco de dados
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true, // Carrega automaticamente as entidades
        synchronize: true, // Sincroniza o schema com o DB (Ótimo para dev, NUNCA use em prod)
      }),
    }),

    // Seus módulos
    DetectionModuleModule,
    TrainingModuleModule,
    StatsModuleModule,
    AppModuleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}