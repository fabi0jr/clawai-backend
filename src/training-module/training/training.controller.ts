import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
  } from '@nestjs/common';
  import { TrainingService, CreateTrainingSessionDto } from './training.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  
  @Controller('training')
  export class TrainingController {
    constructor(private readonly trainingService: TrainingService) {}
  
    // GET /training/sessions/recent
    // (Este método permanece o mesmo)
    @Get('sessions/recent')
    findRecentSessions(@Query('limit') limit: string) {
      const take = limit ? parseInt(limit, 10) : 5;
      return this.trainingService.findRecentSessions(take);
    }
  
    // POST /training/sessions
    // (Este método permanece o mesmo)
    @Post('sessions')
    createSession(@Body() createDto: CreateTrainingSessionDto) {
      return this.trainingService.createSession(createDto);
    }
  
    // --- NOVO ENDPOINT DE UPLOAD ---
  
    @Post('upload')
    @UseInterceptors(
      FileInterceptor('file', {
        // 'file' é o nome do campo no formulário (frontend)
        storage: diskStorage({
          destination: './uploads', // A pasta que criamos
          filename: (req, file, cb) => {
            // Garante nomes de arquivo únicos
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const originalName = file.originalname.replace(/\s/g, '_');
            cb(null, `${uniqueSuffix}-${originalName}`);
          },
        }),
      }),
    )
    uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: { sessionId: string }, // Recebemos o ID da sessão junto com o arquivo
    ) {
      if (!body.sessionId) {
        // (Idealmente, isso seria validado por um DTO)
        throw new Error('sessionId é obrigatório');
      }
  
      return this.trainingService.handleFileUpload(file, body.sessionId);
    }
  }