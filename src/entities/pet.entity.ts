import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { RegisterUser } from './register-user.entity';
import { Food } from './food.entity';

@Entity()
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  petName: string;

  @Column()
  petCategory: string;

  @Column()
  petAge: number;

  @Column()
  petBreed: string;

  @Column()
  petWeight: number;

  @Column()
  petGender: string;

  @Column()
  fcmToken: string;

  @Column()
  deviceId: string;

  @ManyToOne(() => RegisterUser, user => user.pets)
  user: RegisterUser;

  @OneToMany(() => Food, food => food.pet)
  foods: Food[];
} 