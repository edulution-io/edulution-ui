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

interface SilentLoginFn {
  (user: string, pass: string): Promise<void>;
}

const useSilentLoginWithPassword = (): SilentLoginFn => {
  const keycloak = new Keycloak({
    url: `${window.location.origin}/auth`,
    realm: 'edulution',
    clientId: 'edu-ui',
  });

  const silentLogin = useCallback<SilentLoginFn>(async (username, password) => {
    await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    const authUrl = await keycloak.createLoginUrl({
      prompt: 'login',
      redirectUri: `${window.location.origin}/silent-check-sso.html`,
    });

    await new Promise<void>((resolve, reject) => {
      let iframe: HTMLIFrameElement;

      const onMessage = (ev: MessageEvent) => {
        if (ev.origin !== window.location.origin) return;
        const href = typeof ev.data === 'string' ? ev.data : '';
        const params = new URL(href).searchParams;
        const hashParams = new URL(href).hash.slice(1);
        const code = params.get('code') ?? new URLSearchParams(hashParams).get('code');
        if (!code) {
          cleanup();
          reject(new Error(`Kein code in message: ${href}`));
        }
        cleanup();
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

    await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: undefined,
      pkceMethod: 'S256',
    });
  }, []);

  return silentLogin;
};

export default useSilentLoginWithPassword;
