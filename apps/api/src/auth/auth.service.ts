import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { OidcMetadata, SigninResponse, SigninRequest, ErrorResponse } from 'oidc-client-ts';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import AUTH_CACHE from '@libs/auth/constants/auth-cache';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
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

  async authenticateUser(body: SigninRequest): Promise<SigninResponse> {
    const extendedBody = {
      ...body,
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
}

export default AuthService;
