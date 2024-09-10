import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { OidcMetadata, SigninResponse, SigninRequest, ErrorResponse } from 'oidc-client-ts';
import AuthErrorMessages from '@libs/auth/authErrorMessages';

const { KEYCLOAK_EDU_UI_SECRET, KEYCLOAK_EDU_UI_CLIENT_ID, KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor() {
    this.keycloakApi = axios.create({
      baseURL: `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}`,
      timeout: 5000,
    });
  }

  authconfig(req: Request): Observable<OidcMetadata> {
    return from(this.keycloakApi.get('/.well-known/openid-configuration')).pipe(
      map((response: AxiosResponse<OidcMetadata>) => {
        const oidcConfig = response.data;

        const apiAuthUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/edu-api/auth`;

        oidcConfig.authorization_endpoint = apiAuthUrl;
        oidcConfig.token_endpoint = apiAuthUrl;

        return oidcConfig;
      }),
      catchError((error) => {
        throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED, error);
      }),
    );
  }

  async authenticateUser(body: SigninRequest): Promise<SigninResponse> {
    const extendedBody = {
      ...body,
      client_id: KEYCLOAK_EDU_UI_CLIENT_ID,
      client_secret: KEYCLOAK_EDU_UI_SECRET,
    };

    try {
      const response = await this.keycloakApi.post<SigninResponse>('/protocol/openid-connect/token', extendedBody, {
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
