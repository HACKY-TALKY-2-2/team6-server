import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TrafficService {
  constructor(private notificationService: NotificationService) {}

  avaliableBuses = ['147', '463', '4211'];

  async getBusArrivalInfo(args: string[]) {
    const validatedBusRoute = this.validateBusRouteNo(args);
    if (validatedBusRoute === undefined) {
      this.notificationService.sendBusRoutesInfo(this.avaliableBuses);
      return;
    }
    if (args.length < 2) {
      this.notificationService.sendBusDirectionInfo(validatedBusRoute);
      return;
    }
    this.notificationService.sendBusArrivalInfo(validatedBusRoute, args[1]);
  }

  validateBusRouteNo(args: string[]) {
    if (args.length === 0) {
      return undefined;
    }
    if (!this.avaliableBuses.includes(args[0])) {
      return undefined;
    }
    return args[0];
  }
}
