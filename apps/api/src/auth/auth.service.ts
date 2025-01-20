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
import { User, UserDocument } from '../users/user.schema';
import { fromBase64 } from '../filesharing/filesharing.utilities';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.keycloakApi = axios.create({
      baseURL: `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}`,
      timeout: 5000,
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
        throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED);
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
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage: ErrorResponse = error.response.data as ErrorResponse;
        throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
      }
      throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED, body);
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
        throw new CustomHttpException(AuthErrorMessages.TotpMissing, HttpStatus.UNAUTHORIZED);
      }

      if (!token) throw new CustomHttpException(AuthErrorMessages.TotpMissing, HttpStatus.UNAUTHORIZED);

      const isTotpValid = AuthService.checkTotp(token, username, totpSecret);

      if (isTotpValid) {
        return this.signin(body, password);
      }

      throw new CustomHttpException(AuthErrorMessages.TotpInvalid, HttpStatus.UNAUTHORIZED);
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
    throw new CustomHttpException(AuthErrorMessages.TotpInvalid, HttpStatus.UNAUTHORIZED);
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
      throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }
  }
}

export default AuthService;
