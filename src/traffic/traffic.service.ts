import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NotificationService } from 'src/notification/notification.service';
import { XMLParser } from 'fast-xml-parser';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class TrafficService {
  constructor(private notificationService: NotificationService) {
    this.parser = new XMLParser();
  }
  parser: XMLParser;
  avaliableBuses = ['147', '463', '4211'];

  routeIdMap = {
    '147': '100100012',
    '465': '100100604',
    '4211': '100100604',
  };

  stopOrderMap = {
    '147': 59,
    '463': 10,
    '4211': 10,
  };

  stopId = '122000178';

  serviceKey = process.env.BUS_KEY;
  subwayKey = process.env.SUBWAY_KEY;
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

  @Cron('/1 * * * * *')
  async getBusArrivalInfoByRoute(route: string) {
    try {
      const response = await axios.get(
        `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute?serviceKey=${this.serviceKey}&stId=${this.stopId}&busRouteId=${this.routeIdMap[route]}&ord=${this.stopOrderMap[route]}`,
      );
      const XMLObj = this.parser.parse(response.data);
      const body = XMLObj.ServiceResult.msgBody;
      console.log(XMLObj.ServiceResult);
      // arrmsg1, arrmsg2 도착메시지
      // exps1 exps2 도착시간 or kals1 kals2 neus1 neus2
      // vehId1 vehId2 차량ID
    } catch (err) {
      console.error(err);
    }
  }

  async getPosByVehicleID(vehID: string) {
    try {
      const response = await axios.get(
        `http://ws.bus.go.kr/api/rest/buspos/getBusPosByVehId?serviceKey=${this.serviceKey}&vehId=${vehID}`,
      );
      const XMLObj = this.parser.parse(response.data);
      const body = XMLObj.ServiceResult.msgBody;
      console.log(XMLObj.ServiceResult);
      // tmX, tmY or posX posY

      return { x: 37.50185, y: 127.0371 };
    } catch (err) {
      console.error(err);
    }
  }

  async getSubwayArrivalInfo() {
    try {
      const response = await axios.get(
        `http://swopenAPI.seoul.go.kr/api/subway/${this.subwayKey}/json/realtimeStationArrival/0/5/서울`,
      );
      console.log(response.data);
      if (response.data.total === 0)
        this.notificationService.sendPlainText('지하철이 끊겼어요 ㅠㅠ');

      const seconds = response.data.barvlDt;
      const minutes = Math.floor(seconds / 60);
      const remainSeconds = seconds % 60;
      this.notificationService.sendPlainText(
        `${minutes}분 ${remainSeconds}초 남았어요`,
      );
    } catch (err) {
      console.error(err);
    }
  }
}
