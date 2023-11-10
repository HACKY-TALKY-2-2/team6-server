import { Module } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({ providers: [TrafficService, NotificationService] })
export class TrafficModule {}
