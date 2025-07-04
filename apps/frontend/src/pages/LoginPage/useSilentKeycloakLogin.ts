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

/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback } from 'react';
import Keycloak from 'keycloak-js';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

interface UseSilentLoginWithPasswordReturn {
  silentLogin: (username: string, password: string) => Promise<void>;
  silentLogout: () => Promise<void>;
}

const useSilentLoginWithPassword = (): UseSilentLoginWithPasswordReturn => {
  const url = new URL('auth', EDU_BASE_URL).href;
  const redirectUri = new URL('silent-check-sso.html', EDU_BASE_URL).href;

  const keycloak = new Keycloak({
    url,
    realm: 'edulution',
    clientId: 'edu-ui',
  });

  const silentLogin = useCallback(async (username: string, password: string) => {
    await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: redirectUri,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    const authUrl = await keycloak.createLoginUrl({
      prompt: 'login',
      redirectUri,
    });

    await new Promise<void>((resolve) => {
      let iframe: HTMLIFrameElement;

      const onMessage = (ev: MessageEvent) => {
        if (ev.origin !== window.location.origin) return;
        const href = typeof ev.data === 'string' ? ev.data : window.location.href;
        const params = new URL(href).searchParams;
        const hashParams = new URL(href).hash.slice(1);
        const code = params.get('code') ?? new URLSearchParams(hashParams).get('code');

        if (!code) {
          cleanup();
        }
        cleanup();

        console.info('Login successful');
        resolve();
      };

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        iframe?.remove();
      };

      window.addEventListener('message', onMessage);

      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = authUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        const doc = iframe.contentDocument;
        const form = doc?.querySelector<HTMLFormElement>('form');
        const u = doc?.querySelector<HTMLInputElement>('input[name="username"]');
        const p = doc?.querySelector<HTMLInputElement>('input[name="password"]');
        if (form && u && p) {
          u.value = username;
          p.value = password;
          form.submit();
        }
      };
    });
  }, []);

  const silentLogout = useCallback(async () => {
    if (keycloak.authenticated) {
      await keycloak.logout({
        redirectUri: EDU_BASE_URL,
      });
    }
  }, []);

  return { silentLogin, silentLogout };
};

export default useSilentLoginWithPassword;
