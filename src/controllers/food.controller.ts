import { Controller, Post, Body, Get, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FoodService } from '../services/food.service';
import { FoodInfoDto } from '../dto/food.dto';
import { Food } from '../entities/food.entity';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Controller('food')
export class FoodController {
  private readonly logger = new Logger(FoodController.name);

  constructor(private readonly foodService: FoodService) {}

  @Post()
  async createFoodInfo(@Body() foodInfoDto: FoodInfoDto): Promise<ApiResponse> {
    try {
      const food = await this.foodService.createFoodInfo(foodInfoDto);
      return {
        success: true,
        message: 'Food information created successfully',
        data: food
      };
    } catch (error) {
      this.logger.error('Error creating food info:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create food information',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('times/:petId')
  async getFoodTimes(@Param('petId') petId: string): Promise<ApiResponse> {
    try {
      if (!petId || isNaN(+petId)) {
        throw new HttpException('Invalid pet ID', HttpStatus.BAD_REQUEST);
      }

      const foods = await this.foodService.getFoodTimes(+petId);
      return {
        success: true,
        message: 'Food times retrieved successfully',
        data: foods
      };
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
          success: false,
          message: 'Failed to fetch food times',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 