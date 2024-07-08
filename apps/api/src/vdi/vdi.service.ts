import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

type BodyType = {
  group: string;
  user: string;
};

const lmnVdiApiSecret = process.env.LMN_VDI_API_SECRET;
const lmnVdiApiUrl = process.env.LMN_VDI_API_URL;

@Injectable()
class VdiService {
  private lmnApi: AxiosInstance;

  constructor() {
    this.lmnApi = axios.create({
      baseURL: `${lmnVdiApiUrl}/api`,
      headers: {
        'LMN-API-Secret': lmnVdiApiSecret,
      },
    });
  }

  async requestVdi(body: BodyType) {
    try {
      const response = await this.lmnApi.post('/connection/request', body, {
        headers: {
          'LMN-API-Secret': lmnVdiApiSecret,
        },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      throw new HttpException('LMN-VDI-API not responding', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getVirtualMachines() {
    try {
      const response = await this.lmnApi.get('/status/clones', {
        headers: {
          'LMN-API-Secret': lmnVdiApiSecret,
        },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      return null;
    }
  }
}

export default VdiService;
