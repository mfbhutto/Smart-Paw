import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterPetDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  petName: string;

  @IsString()
  @IsNotEmpty()
  petCategory: string;

  @IsString()
  @IsNotEmpty()
  petAge: string;

  @IsString()
  @IsNotEmpty()
  petBreed: string;
} 