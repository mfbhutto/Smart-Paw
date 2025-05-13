import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from '../entities/food.entity';
import { FoodInfoDto } from '../dto/food.dto';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async createFoodInfo(createFoodDto: any): Promise<Food> {
    try {
      if (!createFoodDto.petId) {
        throw new HttpException('Pet ID is required', HttpStatus.BAD_REQUEST);
      }

      const pet = await this.petRepository.findOne({
        where: { id: createFoodDto.petId },
      });

      if (!pet) {
        throw new HttpException('Pet not found', HttpStatus.NOT_FOUND);
      }

      const food = this.foodRepository.create({
        ...createFoodDto,
        pet,
      });

      const result = await this.foodRepository.save(food);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      this.logger.error('Error creating food info:', {
        error: error.message,
        petId: createFoodDto?.petId
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Error creating food information',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFoodTimes(petId: number): Promise<Food[]> {
    try {
      this.logger.log(`Fetching food times for pet ID: ${petId}`);

      const pet = await this.petRepository.findOne({
        where: { id: petId },
        relations: ['foods'],
      });

      if (!pet) {
        throw new HttpException('Pet not found', HttpStatus.NOT_FOUND);
      }

      if (!pet.foods || pet.foods.length === 0) {
        this.logger.log(`No food times found for pet ID: ${petId}`);
        return [];
      }

      return pet.foods;
    } catch (error) {
      this.logger.error('Error fetching food times:', {
        petId,
        error: error.message
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Error fetching food times',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 