import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TOTP, Secret } from 'otpauth';
import {
  OidcMetadata,
  SigninResponse,
  ErrorResponse,
  ProcessResourceOwnerPasswordCredentialsArgs,
} from 'oidc-client-ts';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import AUTH_CACHE from '@libs/auth/constants/auth-cache';
import { User, UserDocument } from '../users/user.schema';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

const totpConfig = {
  issuer: 'edulution-ui',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
};

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.keycloakApi = axios.create({
      baseURL: `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}`,
      timeout: 5000,
    });
  }

  authconfig(req: Request): Observable<OidcMetadata> {
    return from(this.cacheManager.get<OidcMetadata>(AUTH_CACHE.CACHE_KEY)).pipe(
      switchMap((cachedData: OidcMetadata | undefined) => {
        if (cachedData) {
          return of(cachedData);
        }

        return from(this.keycloakApi.get<OidcMetadata>(AUTH_PATHS.AUTH_OIDC_CONFIG_PATH)).pipe(
          map((response: AxiosResponse<OidcMetadata>) => {
            const oidcConfig = response.data;
            const apiAuthUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/edu-api/${AUTH_PATHS.AUTH_ENDPOINT}`;

            oidcConfig.authorization_endpoint = apiAuthUrl;
            oidcConfig.token_endpoint = apiAuthUrl;

            void this.cacheManager.set(AUTH_CACHE.CACHE_KEY, oidcConfig, AUTH_CACHE.CACHE_TTL);
            return oidcConfig;
          }),
        );
      }),
      catchError((error) =>
        throwError(() => new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED, error)),
      ),
    );
  }

  static checkTotp(token: string, username: string, secret: string): boolean {
    const newTotp = new TOTP({ ...totpConfig, label: username, secret });
    return newTotp.validate({ token }) !== null;
  }

  async signin(body: ProcessResourceOwnerPasswordCredentialsArgs, password: string) {
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
      throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED, error);
    }
  }

  async authenticateUser(body: ProcessResourceOwnerPasswordCredentialsArgs): Promise<SigninResponse> {
    const { password: passwordString } = body;
    const { username } = body;
    const user = (await this.userModel.findOne({ username }, 'mfaEnabled isTotpSet totpSecret').lean()) || ({} as User);
    const { mfaEnabled = false, isTotpSet = false, totpSecret = '' } = user;

    if (mfaEnabled && isTotpSet) {
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

  public getQrCode(username: string): string {
    const totpSecret = new Secret({ size: 16 });
    const secret = totpSecret.base32;
    const newTotp = new TOTP({ ...totpConfig, label: username, secret });
    const otpAuthString = newTotp.toString();
    return otpAuthString;
  }

  async setupTotp(username: string, body: { totp: string; secret: string }): Promise<User | null> {
    const { totp, secret } = body;
    const isTotpValid = AuthService.checkTotp(totp, username, secret);
    if (isTotpValid) {
      const user = await this.userModel
        .findOneAndUpdate<User>(
          { username },
          { $set: { mfaEnabled: true, isTotpSet: true, totpSecret: secret } },
          { new: true },
        )
        .lean();
      return user;
    }
    throw new CustomHttpException(AuthErrorMessages.TotpInvalid, HttpStatus.UNAUTHORIZED);
  }
}

export default AuthService;
