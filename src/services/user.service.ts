import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { RegisterUser } from '../entities/register-user.entity';
import { RegisterUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(RegisterUser)
    private userRepository: Repository<RegisterUser>,
  ) {}

  async register(createUserDto: any): Promise<RegisterUser> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.userEmail },
      });

      if (existingUser) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const hashedPassword = await bcrypt.hash(createUserDto.userPassword, 10);
      const user = this.userRepository.create({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.userEmail,
        password: hashedPassword,
        phoneNumber: createUserDto.userPhone,
        address: createUserDto.userAddress,
        fcmToken: createUserDto.fcmToken || '',
        deviceId: createUserDto.deviceId || ''
      });

      const result = await this.userRepository.save(user);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string): Promise<RegisterUser> {
    try {
      if (!email || !password) {
        throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }

      // Remove sensitive data before returning
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as RegisterUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new HttpException(
        {
          message: 'Error during login',
          error: error.message,
          details: error.stack
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUserDto: any): Promise<RegisterUser> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      Object.assign(user, updateUserDto);
      const updatedUser = await this.userRepository.save(user);
      return updatedUser as RegisterUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<RegisterUser> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user as RegisterUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 