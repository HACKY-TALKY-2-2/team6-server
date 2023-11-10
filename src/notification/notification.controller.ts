import { Controller, Post, Query, Req } from '@nestjs/common';
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
  async listenWebhook(@Req() req: Request) {
    console.log(req);
  }
}
