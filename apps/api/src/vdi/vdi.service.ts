import {
  RDPConnection,
  VdiErrorMessages,
  Parameters,
  Attributes,
  LmnVdiRequest,
  GuacamoleConnections,
  GuacRequest,
  LmnVdiResponse,
  VirtualMachines,
} from '@libs/desktopdeployment/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { getDecryptedPassword } from '@libs/common/utils';
import UsersService from '../users/users.service';

const {
  LMN_VDI_API_SECRET,
  LMN_VDI_API_URL,
  GUACAMOLE_API_URL,
  GUACAMOLE_API_PASSWORD,
  GUACAMOLE_API_USER,
  EDUI_ENCRYPTION_KEY,
} = process.env;

@Injectable()
class VdiService {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  private vdiId = '';

  constructor(private usersService: UsersService) {
    this.guacamoleApi = axios.create({
      baseURL: `${GUACAMOLE_API_URL}/guacamole/api`,
    });
    this.lmnVdiApi = axios.create({
      baseURL: `${LMN_VDI_API_URL}/api`,
      headers: {
        'LMN-API-Secret': LMN_VDI_API_SECRET,
      },
    });
  }

  static createRDPConnection(
    username: string,
    customParams: Partial<Parameters> = {},
    customAttributes: Partial<Attributes> = {},
  ): RDPConnection {
    const rdpConnection = new RDPConnection();
    rdpConnection.name = `${username}`;
    rdpConnection.parameters = { ...rdpConnection.parameters, ...customParams };
    rdpConnection.attributes = { ...rdpConnection.attributes, ...customAttributes };
    return rdpConnection;
  }

  static getConnectionIdentifierByUsername(connections: GuacamoleConnections, username: string): string | null {
    const connectionValues = Object.values(connections);
    const connection = connectionValues.find((itm) => itm.name === username);

    if (connection) {
      return connection.identifier;
    }

    return null;
  }

  async authenticateVdi() {
    try {
      const response = await this.guacamoleApi.post<GuacRequest>(
        '/tokens',
        { username: GUACAMOLE_API_USER, password: GUACAMOLE_API_PASSWORD },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      const { authToken, dataSource } = response.data;

      return { authToken, dataSource };
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getConnection(body: GuacRequest, username: string) {
    try {
      const { dataSource, authToken } = body;
      const response = await this.guacamoleApi.get<GuacamoleConnections>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
      );
      const identifier = VdiService.getConnectionIdentifierByUsername(response.data, username);
      if (identifier) this.vdiId = identifier;
      return identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async createOrUpdateSession(body: GuacRequest, username: string) {
    const response = await this.getConnection(body, username);
    if (response != null) {
      return this.updateSession(body, username);
    }
    return this.createSession(body, username);
  }

  async findPwByUsername(username: string) {
    const user = await this.usersService.findOne(username);
    if (!user || !user.password || !EDUI_ENCRYPTION_KEY)
      throw new CustomHttpException(VdiErrorMessages.GuacamoleUserNotFound, HttpStatus.BAD_GATEWAY);
    const encryptedPassword = user.password;
    const password = getDecryptedPassword(encryptedPassword, EDUI_ENCRYPTION_KEY);
    return password;
  }

  async createSession(body: GuacRequest, username: string) {
    const { dataSource, authToken, hostname } = body;
    const password = await this.findPwByUsername(username);
    try {
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      const response = await this.guacamoleApi.post<GuacRequest>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
        rdpConnection,
      );
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async updateSession(body: GuacRequest, username: string) {
    try {
      const { dataSource, authToken, hostname } = body;
      const password = await this.findPwByUsername(username);
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      await this.guacamoleApi.put<GuacRequest>(
        `/session/data/${dataSource}/connections/${this.vdiId}?token=${authToken}`,
        rdpConnection,
      );

      return body;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(body: LmnVdiRequest) {
    try {
      const response = await this.lmnVdiApi.post<LmnVdiResponse>('/connection/request', body);
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getVirtualMachines() {
    try {
      const response = await this.lmnVdiApi.get<VirtualMachines>('/status/clones');
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }
}

export default VdiService;