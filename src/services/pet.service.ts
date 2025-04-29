import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { RegisterUser } from '../entities/register-user.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(RegisterUser)
    private userRepository: Repository<RegisterUser>,
  ) {}

  async register(createPetDto: any): Promise<Pet> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createPetDto.userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const pet = this.petRepository.create({
        ...createPetDto,
        user,
      });

      const result = await this.petRepository.save(pet);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating pet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPetsByUserId(userId: number): Promise<Pet[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['pets'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user.pets;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching pets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 