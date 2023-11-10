import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

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
  helpMessage = `
  명령어 목록:
    !버스
      - 해당 버스 도착 정보를 확인합니다.
    !지하철
      - 해당 지하철 도착 정보를 확인합니다.
    !help | !명령어 
      - 역삼이 bot 명령어 목록을 확인합니다.
  `;
  colorVariant = [
    'cobalt',
    'green',
    'orange',
    'red',
    'black',
    'pink',
    'purple',
  ];

  async sendPlainText(message: string) {
    await this.client.post(
      `/groups/@${this.groupName}/messages?botName=${this.botName}`,
      { plainText: message },
    );
  }

  async sendHelpMessage() {
    await this.sendPlainText(this.helpMessage);
  }

  async sendBusRoutesInfo(routes: string[]) {
    const buttons = routes.map((route, index) => {
      return [
        {
          title: route,
          colorVariant: this.colorVariant[index % this.colorVariant.length],
          url: 'https://team6-frontend.vercel.app',
        },
      ];
    });
    await Promise.all(
      buttons.map(async (button) => {
        await this.client.post(
          `/groups/@${this.groupName}/messages?botName=${this.botName}`,
          { buttons: button },
        );
      }),
    );
  }

  async sendSubwayInfo() {
    const button = {
      title: '지도에서 확인하기',
      colorVariant: 1,
      url: 'https://team6-frontend.vercel.app',
    };
    await this.client.post(
      `/groups/@${this.groupName}/messages?botName=${this.botName}`,
      { buttons: [button] },
    );
  }

  async sendBusDirectionInfo(route: string) {}

  async sendBusArrivalInfo(route: string, direction: string) {}

  validateWebhookEvent(req: Request) {
    return (
      req.body.event === 'push' &&
      req.body.type === 'message' &&
      req.body.entity.chatType === 'group' &&
      req.body.entity.plainText.startsWith('!')
    );
  }

  parseMessage(message: string) {
    const [command, ...args] = message.split(' ');
    const commandWithOutMark = command.slice(1);
    return { command: commandWithOutMark, args };
  }
}
