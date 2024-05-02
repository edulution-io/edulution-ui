/* eslint-disable max-classes-per-file */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { User } from './user.model';
import LoggerEnum from '../types/logger';

export type AccessToken = string;

interface KeycloakUserInfoResponse {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export class AuthenticationError extends Error {}

@Injectable()
export class AuthenticationService {
  private readonly baseURL: string | undefined;

  private readonly realm: string | undefined;

  constructor(private httpService: HttpService) {
    this.baseURL = process.env.KEYCLOAK_BASE_URL;
    this.realm = process.env.KEYCLOAK_REALM;
  }

  async authenticate(accessToken: AccessToken): Promise<User> {
    const url = `${this.baseURL}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    try {
      const response = await this.httpService
        .get<KeycloakUserInfoResponse>(url, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .toPromise();
      return {
        id: response?.data?.sub ?? '',
        username: response?.data?.preferred_username ?? '',
      };
    } catch (e) {
      Logger.log(e, LoggerEnum.AUTH);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      throw new AuthenticationError(e.message);
    }
  }
}
