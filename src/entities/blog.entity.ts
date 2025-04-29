import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RegisterUser } from './register-user.entity';

@Entity('blog')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blogTitle: string;

  @Column('text')
  blogText: string;

  @ManyToOne(() => RegisterUser, user => user.blogs)
  user: RegisterUser;
} 