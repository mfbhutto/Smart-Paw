import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class FoodInfoDto {
  @IsNumber()
  @IsNotEmpty()
  petId: number;

  @IsString()
  @IsNotEmpty()
  favoriteFood: string;

  @IsString()
  @IsNotEmpty()
  eatingTime1: string;

  @IsString()
  @IsNotEmpty()
  eatingTime2: string;

  @IsString()
  @IsNotEmpty()
  eatingTime3: string;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
} 