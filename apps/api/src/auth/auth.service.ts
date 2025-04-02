/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Secret, TOTP } from 'otpauth';
import { ErrorResponse, OidcMetadata, SigninResponse } from 'oidc-client-ts';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import AUTH_TOTP_CONFIG from '@libs/auth/constants/totp-config';
import type AuthRequestArgs from '@libs/auth/types/auth-request';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { User, UserDocument } from '../users/user.schema';
import { fromBase64 } from '../filesharing/filesharing.utilities';
import SseService from '../sse/sse.service';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sseService: SseService,
  ) {
    this.keycloakApi = axios.create({
      baseURL: `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}`,
    });
  }

  authconfig(req: Request): Observable<OidcMetadata> {
    return from(this.keycloakApi.get<OidcMetadata>(AUTH_PATHS.AUTH_OIDC_CONFIG_PATH)).pipe(
      map((response: AxiosResponse<OidcMetadata>) => {
        const oidcConfig = response.data;
        const apiAuthUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/${EDU_API_ROOT}/${AUTH_PATHS.AUTH_ENDPOINT}`;

        oidcConfig.authorization_endpoint = apiAuthUrl;
        oidcConfig.token_endpoint = apiAuthUrl;
        return oidcConfig;
      }),
      catchError(() => {
        throw new HttpException(
          { error: AuthErrorMessages.Unknown, error_description: AuthErrorMessages.KeycloakConnectionFailed },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }),
    );
  }

  static checkTotp(token: string, username: string, secret: string): boolean {
    const newTotp = new TOTP({ ...AUTH_TOTP_CONFIG, label: username, secret });
    return newTotp.validate({ token }) !== null;
  }

  async signin(body: AuthRequestArgs, password?: string) {
    const extendedBody = {
      ...body,
      password,
      client_id: KEYCLOAK_EDU_UI_CLIENT_ID,
      client_secret: KEYCLOAK_EDU_UI_SECRET,
    };

    try {
      const response = await this.keycloakApi.post<SigninResponse>(AUTH_PATHS.AUTH_OIDC_TOKEN_PATH, extendedBody, {
        headers: {
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data && error.response.status < 500) {
        const errorMessage: ErrorResponse = error.response.data as ErrorResponse;
        throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof AxiosError && error.response && error.response.status === 503)
        throw new HttpException(
          { error: AuthErrorMessages.Unknown, error_description: AuthErrorMessages.KeycloakConnectionFailed },
          error.response.status,
        );
      throw new HttpException(
        { error: AuthErrorMessages.Unknown, error_description: AuthErrorMessages.LmnConnectionFailed },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async authenticateUser(body: AuthRequestArgs): Promise<SigninResponse> {
    const { grant_type: grantType } = body;
    if (grantType === 'refresh_token') {
      return this.signin(body);
    }
    const { password: passwordHash } = body;
    const passwordString = fromBase64(passwordHash);
    const { username } = body;
    const user = (await this.userModel.findOne({ username }, 'mfaEnabled totpSecret').lean()) || ({} as User);
    const { mfaEnabled = false, totpSecret = '' } = user;

    if (mfaEnabled) {
      const lastColonIndex = passwordString.lastIndexOf(':');

      let password: string;
      let token: string | undefined;

      if (lastColonIndex !== -1) {
        password = passwordString.slice(0, lastColonIndex);
        token = passwordString.slice(lastColonIndex + 1);
      } else {
        throw new HttpException(
          { error: AuthErrorMessages.TotpMissing, error_description: AuthErrorMessages.TotpMissing },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!token)
        throw new HttpException(
          { error: AuthErrorMessages.TotpMissing, error_description: AuthErrorMessages.TotpMissing },
          HttpStatus.UNAUTHORIZED,
        );

      const isTotpValid = AuthService.checkTotp(token, username, totpSecret);

      if (isTotpValid) {
        return this.signin(body, password);
      }

      throw new HttpException(
        { error: AuthErrorMessages.TotpInvalid, error_description: AuthErrorMessages.TotpInvalid },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.signin(body, passwordString);
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public getQrCode(username: string): string {
    const totpSecret = new Secret({ size: 16 });
    const secret = totpSecret.base32;
    const newTotp = new TOTP({ ...AUTH_TOTP_CONFIG, label: username, secret });
    const otpAuthString = Buffer.from(newTotp.toString()).toString('base64');
    return otpAuthString;
  }

  async setupTotp(username: string, body: { totp: string; secret: string }): Promise<User | null> {
    const { totp, secret } = body;
    const isTotpValid = AuthService.checkTotp(totp, username, secret);
    if (isTotpValid) {
      const user = await this.userModel
        .findOneAndUpdate<User>(
          { username },
          { $set: { mfaEnabled: true, totpSecret: secret } },
          { new: true, projection: { totpSecret: 0, password: 0 } },
        )
        .lean();
      return user;
    }
    throw new CustomHttpException(AuthErrorMessages.TotpInvalid, HttpStatus.UNAUTHORIZED, undefined, AuthService.name);
  }

  async getTotpInfo(username: string) {
    const user = await this.userModel.findOne({ username }, 'mfaEnabled').lean();
    if (!user) return false;
    const { mfaEnabled = false } = user;
    if (mfaEnabled) {
      return true;
    }
    return false;
  }

  async disableTotp(username: string) {
    try {
      const user = await this.userModel
        .findOneAndUpdate<User>(
          { username },
          { $set: { mfaEnabled: false, totpSecret: '' } },
          { new: true, projection: { totpSecret: 0, password: 0 } },
        )
        .lean();
      return user;
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND, undefined, AuthService.name);
    }
  }

  loginViaApp(body: { username: string; password: string; totpValue?: string }, sessionId: string) {
    const { username, password, totpValue } = body;
    const isConnectionActive = this.sseService.getUserConnection(sessionId);

    if (!isConnectionActive) throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);

    this.sseService.sendEventToUser(
      sessionId,
      btoa(JSON.stringify({ username, password, totpValue })),
      SSE_MESSAGE_TYPE.MESSAGE,
    );
  }
}

export default AuthService;
