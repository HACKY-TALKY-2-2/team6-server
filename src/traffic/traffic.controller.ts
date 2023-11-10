import { Controller, Get, Param } from '@nestjs/common';
import { TrafficService } from './traffic.service';

@Controller('traffic')
export class TrafficController {
  constructor(private trafficService: TrafficService) {}

  @Get('/bus/arrival/:route')
  async getBusArrivalInfo(@Param('route') route: string) {
    return this.trafficService.getBusArrivalInfo147();
  }

  @Get('/subway')
  async getSubwayInfo() {
    return await this.trafficService.getSubwayInfoWithOutmessage();
  }
}
