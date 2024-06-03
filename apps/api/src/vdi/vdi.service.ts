import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

type BodyType = {
  group: string;
  user: string;
};

const lmnVdiApiSecret = process.env.LMN_VDI_API_SECRET;
const lmnVdiApiUrl = process.env.LMN_VDI_API_URL;

@Injectable()
class VdiService {
  async requestVdi(body: BodyType): Promise<AxiosResponse> {
    try {
      const response = await axios.post(`${lmnVdiApiUrl}/api/connection/request`, body, {
        headers: {
          'LMN-API-Secret': lmnVdiApiSecret,
        },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      throw new HttpException('LMN-VDI-API not responding', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStatusOfClones(): Promise<AxiosResponse | null> {
    try {
      const response = await axios.get(`${lmnVdiApiUrl}/api/status/clones`, {
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
