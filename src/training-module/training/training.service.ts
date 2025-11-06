import { Injectable, NotFoundException } from '@nestjs/common'; // Importe o NotFoundException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from '../entities/training-session.entity';
import { TrainingImage } from '../entities/training-image.entity';
import { Annotation } from '../entities/annotation.entity';

// ... DTO e Construtor ...
export class CreateTrainingSessionDto {
  name: string;
}

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSession)
    private sessionRepository: Repository<TrainingSession>,
    @InjectRepository(TrainingImage)
    private imageRepository: Repository<TrainingImage>,
    @InjectRepository(Annotation)
    private annotationRepository: Repository<Annotation>,
  ) {}

  // Método para o frontend buscar as sessões recentes (para a sidebar)
  async findRecentSessions(limit = 5): Promise<TrainingSession[]> {
    return this.sessionRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  // Método para criar uma nova sessão de treinamento
  async createSession(
    createDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const newSession = this.sessionRepository.create({
      name: createDto.name,
      // O status 'processing' é o padrão, como definido na entidade
    });
    return this.sessionRepository.save(newSession);
  }

  async handleFileUpload(
    file: Express.Multer.File,
    sessionId: string,
  ): Promise<TrainingImage> {
    // 1. Encontra a sessão de treinamento
    const session = await this.sessionRepository.findOneBy({ id: sessionId });
    if (!session) {
      throw new NotFoundException(
        `Sessão de treinamento com ID ${sessionId} não encontrada`,
      );
    }

    // 2. Cria a nova entidade de imagem
    const newImage = this.imageRepository.create({
      filename: file.originalname,
      storagePath: file.path, // O Multer nos dá o caminho onde o arquivo foi salvo
      session: session, // Associa a imagem à sessão
    });

    // 3. Salva a imagem no banco de dados
    return this.imageRepository.save(newImage);
  }
}