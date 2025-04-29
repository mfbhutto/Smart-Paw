import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from '../dto/blog.dto';
import { RegisterUser } from '../entities/register-user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(RegisterUser)
    private userRepository: Repository<RegisterUser>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createBlogDto.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const blog = this.blogRepository.create({
        ...createBlogDto,
        user,
      });

      return await this.blogRepository.save(blog);
    } catch (error) {
      throw new HttpException(
        'Error creating blog post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Blog[]> {
    try {
      return await this.blogRepository.find({
        relations: ['user'],
      });
    } catch (error) {
      throw new HttpException(
        'Error fetching blog posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<Blog> {
    try {
      const blog = await this.blogRepository.findOne({ where: { id } });
      if (!blog) {
        throw new HttpException('Blog post not found', HttpStatus.NOT_FOUND);
      }
      return blog;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching blog post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 