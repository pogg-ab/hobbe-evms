import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationConfigService {
  private readonly useSms: boolean = false;

  get useSmsNotification(): boolean {
    return this.useSms;
  }
}
