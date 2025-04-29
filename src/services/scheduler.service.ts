import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from '../entities/food.entity';
import { FirebaseService } from './firebase.service';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    private firebaseService: FirebaseService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkFoodTimes() {
    try {
      console.log('Starting food time check...');
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const foods = await this.foodRepository.find({
        relations: ['pet'],
      });

      console.log(`Found ${foods.length} food records to check`);

      // ✅ Log all food records with details
      foods.forEach((food) => {
        console.log('Food Record:', JSON.stringify(food, null, 2));
      });

      for (const food of foods) {
        if (!food.fcmToken) {
          console.log(`Skipping food record ${food.id} - no FCM token`);
          continue;
        }

        const times = [food.eatingTime1, food.eatingTime2, food.eatingTime3].filter(Boolean);
        const nearestTime = this.findNearestTime(times, currentTimeString);

        // if (nearestTime && this.isTimeWithinRange(nearestTime, currentTimeString, 40)) {
          console.log(`Sending notification for ${food.pet.petName} - nearest time: ${nearestTime}`);
          await this.firebaseService.sendNotification(
            food.fcmToken,
            'Food Time Reminder',
            `It's time to feed ${food.pet.petName}!`
          );
        // }
      }
    } catch (error) {
      console.error('Error in food time check:', error);
    }
  }

  private findNearestTime(times: string[], currentTime: string): string | null {
    if (times.length === 0) return null;
    
    const currentMinutes = this.timeToMinutes(currentTime);
    let nearestTime: string | null = null;
    let minDiff = Infinity;

    for (const time of times) {
      const timeMinutes = this.timeToMinutes(time);
      const diff = Math.abs(timeMinutes - currentMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        nearestTime = time;
      }
    }

    return nearestTime;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isTimeWithinRange(time: string, currentTime: string, rangeMinutes: number): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const currentMinutes = this.timeToMinutes(currentTime);
    const diff = Math.abs(timeMinutes - currentMinutes);
    return diff <= rangeMinutes;
  }
}
