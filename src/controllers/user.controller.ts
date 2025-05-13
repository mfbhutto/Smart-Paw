import { Controller, Post, Body, Put, Param, Get, UseInterceptors, UploadedFile, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { RegisterUser } from '../entities/register-user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../services/upload.service';
import { memoryStorage } from 'multer';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    @InjectRepository(RegisterUser)
    private readonly userRepository: Repository<RegisterUser>,
    private readonly uploadService: UploadService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: any): Promise<RegisterUser> {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: any) {
    try {
      this.logger.log('Login request received:', loginUserDto);

      // Handle different possible field names
      const email = loginUserDto.email || loginUserDto.userEmail;
      const password = loginUserDto.password || loginUserDto.userPassword;

      if (!email || !password) {
        this.logger.error('Missing credentials:', { 
          receivedFields: Object.keys(loginUserDto),
          email: !!email,
          password: !!password 
        });
        throw new BadRequestException('Email and password are required. Please provide both email and password in the request body.');
      }

      this.logger.log(`Login attempt for email: ${email}`);
      const user = await this.userService.login(email, password);
      
      return {
        success: true,
        message: 'Login successful',
        data: user
      };
    } catch (error) {
      this.logger.error('Login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        receivedData: loginUserDto
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Login failed',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any): Promise<RegisterUser> {
    return this.userService.update(+id, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RegisterUser> {
    return this.userService.findOne(+id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(new Error('No file received'), false);
      }
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    try {
      // if (!file || !file.buffer) {
      //   throw new BadRequestException('No file uploaded or file buffer is empty. Please make sure to send a valid image file with the key "image" in form-data');
      // }

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Delete old image if exists
      if (user.imageUrl) {
        try {
          await this.uploadService.deleteImage(user.imageUrl);
        } catch (error) {
          this.logger.error('Error deleting old image:', error);
          // Continue with upload even if delete fails
        }
      }

      const imageUrl = await this.uploadService.uploadUserImage(file);
      user.imageUrl = imageUrl;
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl }
      };
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to upload image',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 