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
import { useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';
import AUTH_CONFIG from '@libs/auth/constants/auth-config';

interface UseSilentLoginWithPasswordReturn {
  silentLogin: (username: string, password: string) => Promise<void>;
  silentLogout: () => Promise<void>;
}

const useSilentLoginWithPassword = (): UseSilentLoginWithPasswordReturn => {
  const url = new URL('auth', EDU_BASE_URL).href;
  const redirectUri = new URL('silent-check-sso.html', EDU_BASE_URL).href;

  const keycloakRef = useRef<Keycloak>();
  if (!keycloakRef.current) {
    keycloakRef.current = new Keycloak({
      url,
      realm: AUTH_CONFIG.KEYCLOAK_REALM,
      clientId: AUTH_CONFIG.KEYCLOAK_CLIENT_ID,
    });
  }
  const keycloak = keycloakRef.current;

  const silentLogin = useCallback(
    async (username: string, password: string) => {
      try {
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

          const cleanup = () => {
            iframe?.remove();
          };

          const onMessage = (ev: MessageEvent) => {
            if (ev.origin !== window.location.origin) return;

            cleanup();
            resolve();
          };

          window.addEventListener('message', onMessage, { once: true });

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
      } catch (error) {
        console.error(error);
      }
    },
    [keycloak],
  );

  const silentLogout = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const logoutUrl = `${url}/realms/${AUTH_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';

        let done = false;
        const cleanup = () => {
          if (done) return;
          done = true;
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            console.error(e);
          }
          keycloak.clearToken?.();
          resolve();
        };

        iframe.onload = async () => {
          try {
            const doc = iframe.contentDocument;
            const form = doc?.querySelector<HTMLFormElement>('form.form-actions');
            if (!form) {
              console.warn('Logout form not found, cleaning up');
              cleanup();
              return;
            }

            const action = form.getAttribute('action')!;
            const sessionCode = form.querySelector<HTMLInputElement>('input[name="session_code"]')?.value ?? '';

            await fetch(action, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                session_code: sessionCode,
                confirmLogout: 'Logout',
              }),
            });

            cleanup();
          } catch (e) {
            console.error('Silent logout failed:', e);
            cleanup();
          }
        };

        iframe.onerror = cleanup;
        iframe.src = logoutUrl;
        document.body.appendChild(iframe);

        // Sicherheit: Timeout, damit Promise nicht ewig hängt
        setTimeout(cleanup, 5000);
      }),
    [keycloak, url],
  );

  return { silentLogin, silentLogout };
};

export default useSilentLoginWithPassword;
