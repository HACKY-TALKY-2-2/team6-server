import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { TrafficService } from './traffic/traffic.service';
import { TrafficModule } from './traffic/traffic.module';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    NotificationModule,
    TrafficModule,
  ],
  controllers: [AppController],
  providers: [AppService, TrafficService],
})
export class AppModule {}
