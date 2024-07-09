import { RDPConnection, VdiErrorMessages, Parameters, Attributes } from '@libs/desktopdeployment/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

type BodyType = {
  group: string;
  user: string;
};

interface ConAttributes {
  [key: string]: any;
}

interface Item {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConAttributes;
  activeConnections: number;
  lastActive?: number;
}

interface Data {
  [key: string]: Item;
}

const lmnVdiApiSecret = process.env.LMN_VDI_API_SECRET;
const lmnVdiApiUrl = process.env.LMN_VDI_API_URL;
const gucamoleApiUrl = process.env.GUACAMOLE_API_URL;

@Injectable()
class VdiService {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  private vdiId = '';

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

  static createRDPConnection(
    customParams: Partial<Parameters> = {},
    customAttributes: Partial<Attributes> = {},
  ): RDPConnection {
    const rdpConnection = new RDPConnection();
    rdpConnection.parameters = { ...rdpConnection.parameters, ...customParams };
    rdpConnection.attributes = { ...rdpConnection.attributes, ...customAttributes };
    return rdpConnection;
  }

  static getIdentifierByName(data: Data, username: string): string | null {
    const items = Object.values(data);

    const item = items.find((itm) => itm.name === username);

    if (item) {
      return item.identifier;
    }

    return null;
  }

  async authenticateVdi(body: { username: string; password: string }) {
    try {
      const response = await this.guacamoleApi.post('/tokens', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data as AxiosResponse;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getConnections(body: { dataSource: string; token: string }, username: string) {
    try {
      const { dataSource, token } = body;
      const response = await this.guacamoleApi.get(`/session/data/${dataSource}/connections?token=${token}`);
      const identifier = VdiService.getIdentifierByName(response.data as Data, username);
      if (identifier) this.vdiId = identifier;
      return identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getSession(body: { id: number; dataSource: string; token: string }) {
    try {
      const { id, dataSource, token } = body;
      const response = await this.guacamoleApi.get(`/session/data/${dataSource}/connections/${id}?token=${token}`);
      return response.data as AxiosResponse;
    } catch (e) {
      return null;
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
      const requestBody = VdiService.createRDPConnection({
        hostname,
        username,
        /* Get from database */
        password: 'DemoMuster!',
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
      const requestBody = VdiService.createRDPConnection({
        hostname,
        username,
        /* Get from database */
        password: 'DemoMuster!',
      });

      requestBody.name = `${username}`;

      await this.guacamoleApi.put(`/session/data/${dataSource}/connections/${this.vdiId}?token=${token}`, requestBody);

      return body;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(body: BodyType) {
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
