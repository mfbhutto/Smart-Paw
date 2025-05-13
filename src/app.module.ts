import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RegisterUser } from './entities/register-user.entity';
import { Pet } from './entities/pet.entity';
import { Food } from './entities/food.entity';
import { Blog } from './entities/blog.entity';
import { UserController } from './controllers/user.controller';
import { PetController } from './controllers/pet.controller';
import { FoodController } from './controllers/food.controller';
import { BlogController } from './controllers/blog.controller';
import { UserService } from './services/user.service';
import { PetService } from './services/pet.service';
import { FoodService } from './services/food.service';
import { BlogService } from './services/blog.service';
import { FirebaseService } from './services/firebase.service';
import { SchedulerService } from './services/scheduler.service';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './services/upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [RegisterUser, Pet, Food, Blog],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RegisterUser, Pet, Food, Blog]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(new Error('No file received'), false);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [UserController, PetController, FoodController, BlogController],
  providers: [
    UserService, 
    PetService, 
    FoodService, 
    BlogService, 
    FirebaseService, 
    SchedulerService, 
    UploadService
  ],
})
export class AppModule {} 