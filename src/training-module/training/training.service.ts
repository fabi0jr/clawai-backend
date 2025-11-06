import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm'; // 1. Importe EntityManager
import { TrainingSession } from '../entities/training-session.entity';
import { TrainingImage } from '../entities/training-image.entity';
import { Annotation } from '../entities/annotation.entity';
import { CreateAnnotationDto } from '../dto/create-annotation.dto'; // 2. Importe o DTO

export class CreateTrainingSessionDto {
  name: string;
}

@Injectable()
export class TrainingService {
  constructor(
    // 3. Injete o EntityManager
    private readonly entityManager: EntityManager,

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

  async getAnnotationsForImage(imageId: string): Promise<Annotation[]> {
    const image = await this.imageRepository.findOneBy({ id: imageId });
    if (!image) {
      throw new NotFoundException(`Imagem com ID ${imageId} não encontrada`);
    }

    return this.annotationRepository.find({
      where: { image: { id: imageId } },
    });
  }

  async saveAnnotations(
    imageId: string,
    annotationsDto: CreateAnnotationDto[],
  ): Promise<Annotation[]> {
    // Roda tudo dentro de uma transação
    return this.entityManager.transaction(async (manager) => {
      // 1. Encontra a imagem
      const image = await manager.findOneBy(TrainingImage, { id: imageId });
      if (!image) {
        throw new NotFoundException(`Imagem com ID ${imageId} não encontrada`);
      }

      // 2. Apaga todas as anotações antigas desta imagem
      await manager.delete(Annotation, { image: { id: imageId } });

      // 3. Cria as novas anotações
      const newAnnotations = annotationsDto.map((dto) => {
        return manager.create(Annotation, {
          ...dto,
          image: image, // Associa à imagem
        });
      });

      // 4. Salva o novo array de anotações
      return manager.save(Annotation, newAnnotations);
    });
  }
}