import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from '../entities/food.entity';
import { FoodInfoDto } from '../dto/food.dto';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async createFoodInfo(createFoodDto: any): Promise<Food> {
    try {
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating food information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFoodTimes(petId: number): Promise<Food[]> {
    try {
      const pet = await this.petRepository.findOne({
        where: { id: petId },
        relations: ['foods'],
      });

      if (!pet) {
        throw new HttpException('Pet not found', HttpStatus.NOT_FOUND);
      }

      return pet.foods;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching food times',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 