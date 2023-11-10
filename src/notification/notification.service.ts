import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  client = axios.create({
    headers: {
      'x-access-key': process.env.CHANNEL_API_KEY,
      'x-access-secret': process.env.CHANNEL_API_SECRET,
    },
    baseURL: ' https://api.channel.io/open/v5',
  });
  botName = '역삼이';
  groupName = 'hacky-talky';

  async sendPlainText(message: string) {
    await this.client.post(
      `/groups/@${this.groupName}/messages?botName=${this.botName}`,
      { plainText: message },
    );
  }
}
