import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { RegisterUser } from '../entities/register-user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: any): Promise<RegisterUser> {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: { email: string; password: string }): Promise<RegisterUser> {
    return this.userService.login(loginUserDto.email, loginUserDto.password);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any): Promise<RegisterUser> {
    return this.userService.update(+id, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RegisterUser> {
    return this.userService.findOne(+id);
  }
} 