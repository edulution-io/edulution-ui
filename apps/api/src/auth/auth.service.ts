/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import AUTH_TOTP_CONFIG from '@libs/auth/constants/totp-config';
import type AuthRequestArgs from '@libs/auth/types/auth-request';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type LoginQrSseDto from '@libs/auth/types/loginQrSse.dto';
import { decodeBase64Api, encodeBase64Api } from '@libs/common/utils/getBase64StringApi';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import UserRoles from '@libs/user/constants/userRoles';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import { User, UserDocument } from '../users/user.schema';
import SseService from '../sse/sse.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sseService: SseService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {
    this.keycloakApi = axios.create({
      baseURL: `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}`,
    });
  }

  static checkTotp(token: string, username: string, secret: string): boolean {
    const newTotp = new TOTP({ ...AUTH_TOTP_CONFIG, label: username, secret });
    return newTotp.validate({ token }) !== null;
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
    const passwordString = decodeBase64Api(passwordHash);
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

  async disableTotpForUser(username: string, ldapGroups: string[]) {
    if (!username) {
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND, undefined, AuthService.name);
    }

    if (ldapGroups.includes(GroupRoles.STUDENT)) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.UNAUTHORIZED,
        undefined,
        AuthService.name,
      );
    }

    try {
      const updateUser = await this.userModel.findOne<User>({ username }).lean();
      const updateUserRoles = updateUser?.ldapGroups;
      const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

      const userHasPermission =
        getIsAdmin(ldapGroups, adminGroups) ||
        (ldapGroups.includes(GroupRoles.TEACHER) && !!updateUserRoles?.roles.includes(UserRoles.STUDENT));

      if (!userHasPermission) {
        throw new Error();
      }
    } catch (error) {
      throw new CustomHttpException(
        AuthErrorMessages.Unauthorized,
        HttpStatus.UNAUTHORIZED,
        undefined,
        AuthService.name,
      );
    }

    await this.disableTotp(username);

    return { success: true, status: HttpStatus.OK };
  }

  loginViaApp(body: LoginQrSseDto, sessionId: string) {
    const { username, password } = body;
    const isConnectionActive = this.sseService.getUserConnection(sessionId);

    if (!isConnectionActive) throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);

    this.sseService.sendEventToUser(
      sessionId,
      encodeBase64Api(JSON.stringify({ username, password })),
      SSE_MESSAGE_TYPE.MESSAGE,
    );
  }
}

export default AuthService;
