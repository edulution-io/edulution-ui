import VdiErrorMessage from '@libs/desktopdeployment/types/vdiErrorMessages';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

type BodyType = {
  group: string;
  user: string;
};

const lmnVdiApiSecret = process.env.LMN_VDI_API_SECRET;
const lmnVdiApiUrl = process.env.LMN_VDI_API_URL;
const gucamoleApiUrl = process.env.GUACAMOLE_API_URL;

@Injectable()
class VdiService {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  constructor() {
    this.guacamoleApi = axios.create({
      baseURL: `${gucamoleApiUrl}/guacamole/api`,
    });
    this.lmnVdiApi = axios.create({
      baseURL: `${lmnVdiApiUrl}/api`,
      headers: {
        'LMN-API-Secret': lmnVdiApiSecret,
      },
    });
  }

  async authenticateVdi(body: { username: string; password: string }) {
    try {
      const response = await this.guacamoleApi.post('/tokens', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessage.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getConnections(body: { dataSource: string; token: string }) {
    try {
      const { dataSource, token } = body;
      const response = await this.guacamoleApi.get(`/session/data/${dataSource}/connections?token=${token}`);
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessage.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(body: BodyType) {
    try {
      const response = await this.lmnVdiApi.post('/connection/request', body);
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessage.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getVirtualMachines() {
    try {
      const response = await this.lmnVdiApi.get('/status/clones');
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessage.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }
}

export default VdiService;
