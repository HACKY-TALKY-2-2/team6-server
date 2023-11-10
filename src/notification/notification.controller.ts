import {
  Controller,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('/plain-text')
  async sendPlainText(@Query('message') message: string) {
    try {
      await this.notificationService.sendPlainText(message);
    } catch (err) {
      console.error(err);
      return err;
    }
  }

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
        this.notificationService.sendPlainText('버스 개발 중..');
        break;
      case '지하철':
        this.notificationService.sendPlainText('지하철 개발 중..');
        break;
      default:
        this.notificationService.sendPlainText('지원되지 않는 명령어입니다.');
    }
  }
}
