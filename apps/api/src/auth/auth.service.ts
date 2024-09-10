import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import CustomHttpException from '@libs/error/CustomHttpException';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { OidcMetadata, SigninResponse, SigninRequest, ErrorResponse } from 'oidc-client-ts';
import AuthErrorMessages from '@libs/auth/authErrorMessages';

const { EDUI_AUTH_CLIENT_SECRET, EDUI_AUTH_CLIENT_ID, EDUI_AUTH_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  private keycloakApi: AxiosInstance;

  constructor() {
    this.keycloakApi = axios.create({
      baseURL: KEYCLOAK_API,
      timeout: 5000,
    });
  }

  authconfig(req: Request): Observable<OidcMetadata> {
    const targetUrl = `${KEYCLOAK_API}/realms/${EDUI_AUTH_REALM}/.well-known/openid-configuration`;

    return from(this.keycloakApi.get(targetUrl)).pipe(
      map((response: AxiosResponse<OidcMetadata>) => {
        const oidcConfig = response.data;

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/edu-api/auth`;

        oidcConfig.authorization_endpoint = baseUrl;
        oidcConfig.token_endpoint = baseUrl;

        return oidcConfig;
      }),
      catchError((err) => {
        throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.UNAUTHORIZED, err);
      }),
    );
  }

  async authenticateUser(body: SigninRequest) {
    const extendedBody = {
      ...body,
      client_id: EDUI_AUTH_CLIENT_ID,
      client_secret: EDUI_AUTH_CLIENT_SECRET,
    };

    try {
      const response = await this.keycloakApi.post<SigninResponse>(
        `${KEYCLOAK_API}/realms/${EDUI_AUTH_REALM}/protocol/openid-connect/token`,
        extendedBody,
        {
          headers: {
            [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
          },
        },
      );
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
