import {
  RDPConnection,
  VdiErrorMessages,
  Parameters,
  Attributes,
  LmnVdiRequest,
  GuacamoleConnections,
} from '@libs/desktopdeployment/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getDecryptedPassword } from '@libs/common/utils';
import UsersService from '../users/users.service';

@Injectable()
class VdiService {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  private vdiId = '';

  private lmnVdiApiSecret = process.env.LMN_VDI_API_SECRET;

  private lmnVdiApiUrl = process.env.LMN_VDI_API_URL;

  private gucamoleApiUrl = process.env.GUACAMOLE_API_URL;

  private guacamoleApiPwd = process.env.GUACAMOLE_API_PASSWORD;

  private guacamoleApiUser = process.env.GUACAMOLE_API_USER;

  private encryptionKey = process.env.EDUI_ENCRYPTION_KEY as string;

  constructor(private usersService: UsersService) {
    this.guacamoleApi = axios.create({
      baseURL: `${this.gucamoleApiUrl}/guacamole/api`,
    });
    this.lmnVdiApi = axios.create({
      baseURL: `${this.lmnVdiApiUrl}/api`,
      headers: {
        'LMN-API-Secret': this.lmnVdiApiSecret,
      },
    });
  }

  static createRDPConnection(
    customParams: Partial<Parameters> = {},
    customAttributes: Partial<Attributes> = {},
  ): RDPConnection {
    const rdpConnection = new RDPConnection();
    rdpConnection.parameters = { ...rdpConnection.parameters, ...customParams };
    rdpConnection.attributes = { ...rdpConnection.attributes, ...customAttributes };
    return rdpConnection;
  }

  static getIdentifierByName(data: GuacamoleConnections, username: string): string | null {
    const items = Object.values(data);
    const item = items.find((itm) => itm.name === username);

    if (item) {
      return item.identifier;
    }

    return null;
  }

  async authenticateVdi() {
    try {
      const response = await this.guacamoleApi.post(
        '/tokens',
        { username: this.guacamoleApiUser, password: this.guacamoleApiPwd },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      const { authToken, dataSource } = response.data as { authToken: string; dataSource: string };

      return { authToken, dataSource };
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getConnections(body: { dataSource: string; token: string }, username: string) {
    try {
      const { dataSource, token } = body;
      const response = await this.guacamoleApi.get(`/session/data/${dataSource}/connections?token=${token}`);
      const identifier = VdiService.getIdentifierByName(response.data as GuacamoleConnections, username);
      if (identifier) this.vdiId = identifier;
      return identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async createOrUpdateSession(
    body: { id: number; dataSource: string; token: string; hostname: string },
    username: string,
  ) {
    const response = await this.getConnections(body, username);
    if (response != null) {
      return this.updateSession(body, username);
    }
    return this.createSession(body, username);
  }

  async createSession(body: { dataSource: string; token: string; hostname: string }, username: string) {
    try {
      const { dataSource, token, hostname } = body;
      const user = await this.usersService.findOne(username);
      const encryptedPassword = user?.password as string;
      const password = getDecryptedPassword(encryptedPassword, this.encryptionKey);
      const requestBody = VdiService.createRDPConnection({
        hostname,
        username,
        password,
      });

      requestBody.name = `${username}`;

      const response = await this.guacamoleApi.post(
        `/session/data/${dataSource}/connections?token=${token}`,
        requestBody,
      );
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async updateSession(body: { dataSource: string; token: string; hostname: string }, username: string) {
    try {
      const { dataSource, token, hostname } = body;
      const user = await this.usersService.findOne(username);
      const encryptedPassword = user?.password as string;
      const password = getDecryptedPassword(encryptedPassword, this.encryptionKey);
      const requestBody = VdiService.createRDPConnection({
        hostname,
        username,
        password,
      });

      requestBody.name = `${username}`;

      await this.guacamoleApi.put(`/session/data/${dataSource}/connections/${this.vdiId}?token=${token}`, requestBody);

      return body;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(body: LmnVdiRequest) {
    try {
      const response = await this.lmnVdiApi.post('/connection/request', body);
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getVirtualMachines() {
    try {
      const response = await this.lmnVdiApi.get('/status/clones');
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }
}

export default VdiService;