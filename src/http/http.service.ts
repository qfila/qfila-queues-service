import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { User } from '../interfaces/user.interface';

@Injectable()
export class HttpClientService {
  api: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.api = axios.create({
      headers: {
        'X-API-SECRET': this.configService.get('API_SECRET'),
      },
    });
  }

  async findUserById(userId: string): Promise<User> {
    const url = `${this.userUrl}/${userId}`;

    const { data: user } = await this.api.get<User>(url);

    return user;
  }

  async findUsersInfosByIds(usersIds: string[]) {
    const url = `${this.userUrl}?usersIds=${usersIds.join(',')}`;

    const { data: usersInfos } = await this.api.get<User[]>(url);

    return usersInfos;
  }

  private get userUrl() {
    return this.configService.get('USER_SERVICE_URL');
  }
}
