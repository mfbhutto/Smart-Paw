import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PetService } from '../services/pet.service';
import { RegisterPetDto } from '../dto/pet.dto';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  async register(@Body() registerPetDto: RegisterPetDto) {
    return this.petService.register(registerPetDto);
  }

  @Get('user/:userId')
  async getPetsByUserId(@Param('userId') userId: string) {
    return this.petService.getPetsByUserId(+userId);
  }
} 