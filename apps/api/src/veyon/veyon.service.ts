import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { Readable } from 'stream';
import type VeyonApiAuthResponse from '@libs/veyon/types/veyonApiAuthResponse';
import VEYON_AUTH_METHODS from '@libs/veyon/constants/veyonAuthMethods';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import UsersService from '../users/users.service';

const { VEYON_API_HOST_URL } = process.env;

@Injectable()
class VeyonService {
  private veyonApi: AxiosInstance;

  constructor(private usersService: UsersService) {
    this.veyonApi = axios.create({
      baseURL: `${VEYON_API_HOST_URL}/api/v1`,
    });
  }

  async authenticate(ip: string, username: string) {
    const password = await this.usersService.getPassword(username);
    try {
      const response = await this.veyonApi.post<VeyonApiAuthResponse>(
        `/authentication/${ip}`,
        {
          method: VEYON_AUTH_METHODS.AUTHLOGON,
          credentials: { username, password },
        },
        {
          timeout: 60000,
        },
      );
      return {
        ip,
        connectionUid: response.data['connection-uid'],
        validUntil: response.data.validUntil,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error instanceof AxiosError ? error.message : 'Unknown error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getFrameBufferStream(connectionUid: string, framebufferConfig: FrameBufferConfig): Promise<Readable> {
    try {
      const response = await this.veyonApi.get<Readable>(`/framebuffer`, {
        params: framebufferConfig,
        responseType: 'stream',
        headers: {
          'Connection-Uid': connectionUid,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error instanceof AxiosError ? error.message : 'Unknown error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default VeyonService;
