import { Controller, Post, Body, Get, Logger, Req } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/blog.dto';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Controller('blogs')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);

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
  async findAll(@Req() req): Promise<ApiResponse> {
    this.logger.log('GET /blogs endpoint called');
    this.logger.log('Request headers:', JSON.stringify(req.headers));
    this.logger.log('Request method:', req.method);
    this.logger.log('Request URL:', req.url);
    
    try {
      this.logger.log('Calling blogService.findAll()');
      const blogs = await this.blogService.findAll();
      this.logger.log(`Received ${blogs.length} blogs from service`);
      
      const response = {
        success: true,
        message: 'Blogs retrieved successfully',
        data: blogs
      };
      
      this.logger.log('Returning response with blogs data');
      return response;
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }
} 