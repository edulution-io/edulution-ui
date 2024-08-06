import {
  RDPConnection,
  VdiErrorMessages,
  Parameters,
  Attributes,
  LmnVdiRequest,
  GuacamoleConnections,
  GuacamoleDto,
  LmnVdiResponse,
  VirtualMachines,
} from '@libs/desktopdeployment/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import UsersService from '../users/users.service';

const {
  LMN_VDI_API_SECRET,
  LMN_VDI_API_URL,
  GUACAMOLE_API_URL,
  GUACAMOLE_API_PASSWORD,
  GUACAMOLE_API_USER,
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

  static getConnectionIdentifier(connections: GuacamoleConnections, username: string): string | null {
    const connectionValues = Object.values(connections);
    const connection = connectionValues.find((itm) => itm.name === username);

    if (connection) {
      return connection.identifier;
    }

    return null;
  }

  async authenticateVdi() {
    try {
      const response = await this.guacamoleApi.post<GuacamoleDto>(
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

  async getConnection(guacamoleDto: GuacamoleDto, username: string) {
    try {
      const { dataSource, authToken } = guacamoleDto;
      const response = await this.guacamoleApi.get<GuacamoleConnections>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
      );
      const identifier = VdiService.getConnectionIdentifier(response.data, username);
      if (identifier) this.vdiId = identifier;
      return identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async createOrUpdateSession(guacamoleDto: GuacamoleDto, username: string) {
    const identifier = await this.getConnection(guacamoleDto, username);
    const password = await this.usersService.getPassword(username);
    if (identifier != null) {
      return this.updateSession(guacamoleDto, username, password);
    }
    return this.createSession(guacamoleDto, username, password);
  }

  async createSession(guacamoleDto: GuacamoleDto, username: string, password: string) {
    const { dataSource, authToken, hostname } = guacamoleDto;
    try {
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      const response = await this.guacamoleApi.post<GuacamoleDto>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
        rdpConnection,
      );
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async updateSession(guacamoleDto: GuacamoleDto, username: string, password: string) {
    try {
      const { dataSource, authToken, hostname } = guacamoleDto;
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      await this.guacamoleApi.put<GuacamoleDto>(
        `/session/data/${dataSource}/connections/${this.vdiId}?token=${authToken}`,
        rdpConnection,
      );

      return guacamoleDto;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(lmnVdiRequest: LmnVdiRequest) {
    try {
      const response = await this.lmnVdiApi.post<LmnVdiResponse>('/connection/request', lmnVdiRequest);
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
