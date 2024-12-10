import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import type VeyonAuthDto from '@libs/veyon/types/veyonAuth.dto';
import type VeyonApiAuthResponse from '@libs/veyon/types/veyonApiAuthResponse';
import VEYON_AUTH_METHODS from '@libs/veyon/constants/veyonAuthMethods';
import UsersService from '../users/users.service';

const { VEYON_API_HOST_URL } = process.env;

@Injectable()
class VeyonService {
  private veyonApi: AxiosInstance;

  constructor(private usersService: UsersService) {
    this.veyonApi = axios.create({
      baseURL: `${VEYON_API_HOST_URL}/api/v1`,
      timeout: 5000,
    });
  }

  async authenticate(body: VeyonAuthDto, username: string) {
    const password = await this.usersService.getPassword(username);
    const { ipList } = body;

    const promises = ipList.map(async (ip) => {
      try {
        const response = await this.veyonApi.post<VeyonApiAuthResponse>(`/authentication/${ip}`, {
          method: VEYON_AUTH_METHODS.AUTHLOGON,
          credentials: { username, password },
        });
        return {
          ip,
          connectionUid: response.data['connection-uid'],
          validUntil: response.data.validUntil,
        };
      } catch (error) {
        const errorMessage = (error as AxiosError).message || 'Unknown error';
        Logger.error(`Failed to authenticate IP ${ip}: ${errorMessage}`, VeyonService.name);
        return {
          ip,
          error: `Authentication failed for IP ${ip}: ${errorMessage}`,
        };
      }
    });

    const results = await Promise.allSettled(promises);

    const successfulResponses = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);

    return {
      successfulResponses,
    };
  }
}

export default VeyonService;
