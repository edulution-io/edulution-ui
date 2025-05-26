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
import useAuthStore from '@/store/useAuthStore';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

interface SilentLoginFn {
  (username: string, password: string): Promise<void>;
}

const useSilentLoginWithPassword = (): SilentLoginFn => {
  const { keycloak, initKeycloak } = useAuthStore();
  const silentRedirectUri = `${EDU_BASE_URL}/silent-check-sso.html`;

  const silentLogin = useCallback<SilentLoginFn>(async (username, password) => {
    await initKeycloak();
    if (!keycloak) {
      return;
    }
    try {
      const authUrl = await keycloak.createLoginUrl({
        prompt: 'login',
        redirectUri: silentRedirectUri,
      });

      await new Promise<void>((resolve, reject) => {
        let iframe: HTMLIFrameElement;

        const cleanup = () => {
          window.removeEventListener('message', onMessage);
          iframe.onload = null;
          iframe?.remove();
        };

        const onMessage = (ev: MessageEvent) => {
          if (ev.origin !== window.location.origin) {
            return;
          }
          const href = typeof ev.data === 'string' ? ev.data : '';
          let parsed: URL;
          try {
            parsed = new URL(href, window.location.origin);
          } catch {
            cleanup();
            reject(new Error(`Invalid URL in message: ${href}`));
            return;
          }
          const code = parsed.searchParams.get('code') ?? new URLSearchParams(parsed.hash.slice(1)).get('code');
          if (!code) {
            cleanup();
            return;
          }
          cleanup();
          resolve();
        };

        window.addEventListener('message', onMessage);

        iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = authUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          try {
            const doc = iframe.contentDocument!;
            const form = doc.querySelector<HTMLFormElement>('form');
            const u = doc.querySelector<HTMLInputElement>('input[name="username"]');
            const p = doc.querySelector<HTMLInputElement>('input[name="password"]');
            if (form && u && p) {
              u.value = username;
              p.value = password;
              form.submit();
            }
          } catch (err) {
            cleanup();
          }
        };
      });

      await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: undefined,
        pkceMethod: 'S256',
      });
    } catch (error) {
      console.error('Silent login failed', error);
    }
  }, []);

  return silentLogin;
};

export default useSilentLoginWithPassword;
