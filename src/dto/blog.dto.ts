import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBlogDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @IsString()
  @IsNotEmpty()
  blogText: string;
} 