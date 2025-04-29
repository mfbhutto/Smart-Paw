import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FoodService } from '../services/food.service';
import { FoodInfoDto } from '../dto/food.dto';
import { Food } from '../entities/food.entity';

interface ApiResponse {
  success: boolean;
  message: string;
}

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  async createFoodInfo(@Body() foodInfoDto: FoodInfoDto): Promise<ApiResponse> {
    await this.foodService.createFoodInfo(foodInfoDto);
    return {
      success: true,
      message: 'Food information created successfully'
    };
  }

  @Get(':petId')
  async getFoodTimes(@Param('petId') petId: string): Promise<ApiResponse> {
    await this.foodService.getFoodTimes(+petId);
    return {
      success: true,
      message: 'Food times retrieved successfully'
    };
  }
} 