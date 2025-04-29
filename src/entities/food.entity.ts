import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pet } from './pet.entity';

@Entity()
export class Food {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  favoriteFood: string;

  @Column()
  eatingTime1: string;

  @Column()
  eatingTime2: string;

  @Column()
  eatingTime3: string;

  @Column()
  fcmToken: string;

  @Column()
  deviceId: string;

  @ManyToOne(() => Pet, pet => pet.foods)
  pet: Pet;
} 