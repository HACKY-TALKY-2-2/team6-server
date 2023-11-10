import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';
import { TrafficService } from 'src/traffic/traffic.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private trafficService: TrafficService,
  ) {}

  @Post('/webhook/listen')
  async listenWebhook(@Req() req: Request, @Query('token') token: string) {
    if (token !== process.env.CHANNEL_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('invalid token');
    }
    if (!this.notificationService.validateWebhookEvent(req)) {
      return;
    }

    const message = req.body.entity.plainText;
    // validate message 노선
    const { command, args } = this.notificationService.parseMessage(message);
    switch (command) {
      case '버스':
        this.trafficService.getBusArrivalInfo(args);
        break;
      case '지하철':
        this.trafficService.getSubwayArrivalInfo();
        break;
      case 'help':
      case '명령어':
        this.notificationService.sendHelpMessage();
        break;
      default:
        this.notificationService.sendPlainText('지원되지 않는 명령어입니다.');
    }
  }

  @Get('/bus/routes/:routeNo')
  async sendBusDirectionInfo(@Param('routeNo') routeNo: number) {
    this.notificationService.sendPlainText(routeNo.toString());
    // TODO: 도착 5분 전 알림 !!!!!!!!!!
  }

  @Get('/test')
  async getBus() {
    this.trafficService.getBusArrivalInfoByRoute('147');
  }
}
