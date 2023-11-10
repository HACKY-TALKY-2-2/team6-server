import { Module } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { NotificationService } from 'src/notification/notification.service';
import { TrafficController } from './traffic.controller';

@Module({
  providers: [TrafficService, NotificationService],
  controllers: [TrafficController],
})
export class TrafficModule {}
