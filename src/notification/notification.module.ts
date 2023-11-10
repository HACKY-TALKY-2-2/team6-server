import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TrafficService } from 'src/traffic/traffic.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, TrafficService],
  exports: [NotificationService],
})
export class NotificationModule {}
