import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PetService } from '../services/pet.service';
import { RegisterPetDto } from '../dto/pet.dto';
import { Pet } from '../entities/pet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../services/upload.service';
import { memoryStorage } from 'multer';

@Controller('pets')
export class PetController {
  private readonly logger = new Logger(PetController.name);

  constructor(
    private readonly petService: PetService,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  async register(@Body() registerPetDto: RegisterPetDto) {
    try {
      const result = await this.petService.register(registerPetDto);
      return {
        success: true,
        message: 'Pet registered successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          isSuccess: false,
          message: error.message || 'Failed to register pet',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('user/:userId')
  async getPetsByUserId(@Param('userId') userId: string) {
    return this.petService.getPetsByUserId(+userId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(new Error('No file received'), false);
      }
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('petId') petId: number,
  ) {
    try {
      // if (!file || !file.buffer) {
      //   throw new BadRequestException('No file uploaded or file buffer is empty. Please make sure to send a valid image file with the key "image" in form-data');
      // }

      if (!petId) {
        throw new BadRequestException('Pet ID is required');
      }

      const pet = await this.petRepository.findOne({ where: { id: petId } });
      if (!pet) {
        throw new BadRequestException('Pet not found');
      }

      // Delete old image if exists
      if (pet.imageUrl) {
        try {
          await this.uploadService.deleteImage(pet.imageUrl);
        } catch (error) {
          this.logger.error('Error deleting old image:', error);
          // Continue with upload even if delete fails
        }
      }

      const imageUrl = await this.uploadService.uploadPetImage(file);
      pet.imageUrl = imageUrl;
      await this.petRepository.save(pet);

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl }
      };
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to upload image',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 