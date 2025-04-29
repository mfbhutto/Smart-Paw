import { Controller, Post, Body, Get } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/blog.dto';

interface ApiResponse {
  success: boolean;
  message: string;
}

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto): Promise<ApiResponse> {
    await this.blogService.create(createBlogDto);
    return {
      success: true,
      message: 'Blog created successfully'
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse> {
    await this.blogService.findAll();
    return {
      success: true,
      message: 'Blogs retrieved successfully'
    };
  }
} 