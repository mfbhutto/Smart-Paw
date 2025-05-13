import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterPetDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
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

  petWeight: string;

  petGender: string;

  fcmToken: string;

  deviceId: string;

  image: string;
} 