import { Controller, Post, Body, Get, Logger, Req, HttpException, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/blog.dto';
import { log } from 'console';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blog } from '../entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../services/upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { memoryStorage } from 'multer';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Controller('blogs')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);

  constructor(
    private readonly blogService: BlogService,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto): Promise<ApiResponse> {
    try {
      const blog = await this.blogService.create(createBlogDto);
      
      // Transform the response to include only specific user fields
      const response = {
        ...blog,
        user: blog.user ? {
          id: blog.user.id,
          firstName: blog.user.firstName,
          imageUrl: blog.user.imageUrl
        } : null
      };

      return {
        success: true,
        message: 'Blog created successfully',
        data: response
      };
    } catch (error) {
      console.error('Error creating blog:', error.message);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create blog',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
      const logger = new Logger(BlogController.name);
      
      if (!file) {
        logger.error('No file received in fileFilter');
        return cb(new Error('No file received'), false);
      }

      logger.log('File filter processing:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        logger.error('Invalid file extension:', file.originalname);
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('blogId') blogId: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Starting blog image upload process');
      
      if (!file) {
        this.logger.error('No file received');
        throw new BadRequestException('No file uploaded. Please make sure to send a valid image file with the key "image" in form-data');
      }

      this.logger.log('Received file details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'exists' : 'missing'
      });

      // if (!file.buffer) {
      //   this.logger.error('Empty buffer received');
      //   throw new BadRequestException('File buffer is empty. Please make sure to send a valid image file');
      // }

      if (!blogId) {
        this.logger.error('Blog ID not provided');
        throw new BadRequestException('Blog ID is required');
      }

      const blog = await this.blogRepository.findOne({ where: { id: blogId } });
      if (!blog) {
        this.logger.error(`Blog not found with ID: ${blogId}`);
        throw new BadRequestException('Blog not found');
      }

      this.logger.log(`Processing image upload for blog ID: ${blogId}`);
      const imageUrl = await this.uploadService.uploadBlogImage(file);
      this.logger.log(`Successfully uploaded image. URL: ${imageUrl}`);

      blog.imageUrl = imageUrl;
      await this.blogRepository.save(blog);
      this.logger.log(`Updated blog ${blogId} with new image URL`);

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl }
      });
    } catch (error) {
      this.logger.error('Error in uploadImage:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
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

  @Get()
  async findAll(@Req() req): Promise<ApiResponse> {
    try {
      const blogs = await this.blogService.findAll();

      // Transform each blog to include only specific user fields
      const transformedBlogs = blogs.map(blog => ({
        ...blog,
        user: blog.user ? {
          id: blog.user.id,
          firstName: blog.user.firstName,
          imageUrl: blog.user.imageUrl
        } : null
      }));

      return {
        success: true,
        message: 'Blogs retrieved successfully',
        data: transformedBlogs
      };
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }
} 