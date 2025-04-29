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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [UserController, PetController, FoodController, BlogController],
  providers: [UserService, PetService, FoodService, BlogService, FirebaseService, SchedulerService],
})
export class AppModule {} 