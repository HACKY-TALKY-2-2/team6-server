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
    this.notificationService.sendPlainText(message);
  }
}
