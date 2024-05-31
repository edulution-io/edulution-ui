import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

type BodyType = {
  group: string;
  user: string;
};

const lmnApiSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Injectable()
class VdiService {
  async requestVdi(body: BodyType): Promise<AxiosResponse> {
    try {
      const response = await axios.post('http://localhost:5555/api/connection/request', body, {
        headers: {
          'LMN-API-Secret': lmnApiSecret,
        },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      throw new HttpException('LMN-VDI-API not responding', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStatusOfClones(): Promise<AxiosResponse | null> {
    try {
      const response = await axios.get('http://localhost:5555/api/status/clones', {
        headers: {
          'LMN-API-Secret': lmnApiSecret,
        },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      return null;
    }
  }
}

export default VdiService;
