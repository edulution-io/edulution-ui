/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import CustomHttpException from '@libs/error/CustomHttpException';
import ErrorMessage from '@libs/error/errorMessage';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

const { EDUI_AUTH_CLIENT_SECRET, EDUI_AUTH_CLIENT_ID, EDUI_AUTH_REALM, KEYCLOAK_API } = process.env;

@Injectable()
class AuthService {
  constructor(private readonly httpService: HttpService) {
    this.keycloakApi = axios.create({
      baseURL: KEYCLOAK_API,
      timeout: 5000,
    });  }

  authconfig(): Observable<any> {
    const targetUrl = `${KEYCLOAK_API}/realms/${EDUI_AUTH_REALM}/.well-known/openid-configuration`;

    return this.keycloakApi.get(targetUrl).pipe(
      map((response: AxiosResponse) => {
        const oidcConfig = response.data;

        oidcConfig.authorization_endpoint = 'http://localhost:3001/edu-api/auth';
        oidcConfig.token_endpoint = 'http://localhost:3001/edu-api/auth';

        return oidcConfig;
      }),
      catchError((err) => {
        throw new CustomHttpException(
          'Could not fetch OIDC configuration from Keycloak' as ErrorMessage,
          HttpStatus.UNAUTHORIZED,
          err,
        );
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authenticateUser(body: any) {
    Logger.log(body, AuthService.name);

    // Erweitere den Body um die client_id und client_secret
    const extendedBody = {
      ...body,
      client_id: EDUI_AUTH_CLIENT_ID,
      client_secret: EDUI_AUTH_CLIENT_SECRET,
    };

    Logger.log(extendedBody, AuthService.name);

    try {
      const response = await this..post(
        `${KEYCLOAK_API}/realms/${EDUI_AUTH_REALM}/protocol/openid-connect/token`,
        extendedBody,
        {
          headers: {
            [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
          },
        },
      );

      Logger.log(response.data, AuthService.name);
      return response.data;
    } catch (error) {
      Logger.error(`Authentication failed: ${error.message}`, AuthService.name);
      throw new Error('Authentication request to Keycloak failed');
    }
  }
}

export default AuthService;
