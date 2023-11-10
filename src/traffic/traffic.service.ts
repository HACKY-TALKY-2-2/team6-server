import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NotificationService } from 'src/notification/notification.service';
import { XMLParser } from 'fast-xml-parser';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomInt } from 'crypto';
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

  arriveSecondsOf147 = [360, 720];
  posArrive = { x: 37.501, y: 127.0371 };
  posOf147Start = [
    { x: 37.505, y: 127.05 },
    { x: 37.50765, y: 127.06 },
  ];
  congestion = [3, 6];

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

  @Cron(CronExpression.EVERY_SECOND, { timeZone: 'Asia/Seoul' })
  tik() {
    if (this.arriveSecondsOf147[0] % 50 == 0) {
      this.congestion = [randomInt(3, 6), randomInt(3, 6)];
    }
    this.arriveSecondsOf147 = this.arriveSecondsOf147.map((sec) => sec - 1);
    if (this.arriveSecondsOf147[0] <= 0) {
      this.arriveSecondsOf147[0] = this.arriveSecondsOf147[1];
      this.arriveSecondsOf147[1] = 720;
    }
  }
  getBusArrivalInfo147() {
    return this.arriveSecondsOf147.map((sec, i) => {
      const ratio = sec / 360; // Assuming 660 seconds is the total travel time
      const xPos =
        this.posArrive.x + (this.posOf147Start[i].x - this.posArrive.x) * ratio;
      const yPos =
        this.posArrive.y + (this.posOf147Start[i].y - this.posArrive.y) * ratio;

      return {
        sec: sec,
        pos: {
          x: xPos,
          y: yPos,
        },
        congestion: this.congestion[i],
      };
    });
  }

  //  @Cron(CronExpression.EVERY_30_SECONDS)
  async getBusArrivalInfoByRoute(route: string) {
    try {
      const url = `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute`;
      const queryParams =
        '?' +
        encodeURIComponent('serviceKey') +
        `=` +
        encodeURIComponent(this.serviceKey) +
        '&' +
        encodeURIComponent('stId') +
        '=' +
        encodeURIComponent(this.stopId) +
        '&' +
        encodeURIComponent('busRouteId') +
        '=' +
        encodeURIComponent(this.routeIdMap[route]) +
        '&' +
        encodeURIComponent('ord') +
        '=' +
        encodeURIComponent(this.stopOrderMap[route]);

      const response = await axios.get(url + queryParams);
      const XMLObj = this.parser.parse(response.data);
      const body = XMLObj.ServiceResult.msgBody;
      console.log(XMLObj.ServiceResult);
      // arrmsg1, arrmsg2 도착메시지
      // exps1 exps2 도착시간 or kals1 kals2 neus1 neus2
      // vehId1 vehId2 차량ID

      if (XMLObj.ServiceResult.msgHeader.itemCount === '0') {
        const arrmsg1 = '5분 0초 후 도착',
          arrmsg2 = '11분 후 도착';
        const exps1 = 300,
          exps2 = 660;
        return;
        this.notificationService.sendPlainText('버스가 없습니다.');
        return;
      }
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
      // congetion  3 - 6
      return { x: 37.50185, y: 127.0371 };
    } catch (err) {
      console.error(err);
    }
  }

  async getSubwayInfoWithOutmessage() {
    try {
      const response = await axios.get(
        `http://swopenAPI.seoul.go.kr/api/subway/${this.subwayKey}/json/realtimeStationArrival/0/5/역삼`,
      );

      const realtimeArrivalList = response.data.realtimeArrivalList;
      const data = await Promise.all(
        realtimeArrivalList.map(async (arrv, i) => {
          const seconds = arrv.barvlDt;
          const minutes = Math.floor(seconds / 60);
          const remainSeconds = seconds % 60;

          return {
            message: `${arrv.trainLineNm} ${minutes}분 ${remainSeconds}초`,
            curStn: arrv.arvlMsg3,
            curPos:
              i % 2
                ? { x: 37.496486063, y: 127.028361548 }
                : { x: 37.504496014, y: 127.048980637 },
          };
        }),
      );
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  async getSubwayArrivalInfo() {
    try {
      const response = await axios.get(
        `http://swopenAPI.seoul.go.kr/api/subway/${this.subwayKey}/json/realtimeStationArrival/0/5/역삼`,
      );

      if (response.data.total === 0)
        this.notificationService.sendPlainText('지하철이 끊겼어요 ㅠㅠ');
      const realtimeArrivalList = response.data.realtimeArrivalList;
      await Promise.all(
        realtimeArrivalList.map(async (arrv) => {
          const seconds = arrv.barvlDt;
          const minutes = Math.floor(seconds / 60);
          const remainSeconds = seconds % 60;
          await this.notificationService.sendPlainText(
            `${arrv.trainLineNm} ${minutes}분 ${remainSeconds}초 남았어요`,
          );
        }),
      );
      await this.notificationService.sendSubwayInfo();
    } catch (err) {
      console.error(err);
    }
  }
}
