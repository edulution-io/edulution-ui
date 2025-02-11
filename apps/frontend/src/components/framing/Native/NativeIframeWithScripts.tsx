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

import React, { useEffect, useState } from 'react';
import NativeIframeLayout from '@/components/framing/Native/NativeIframeLayout';
import useUserStore from '@/store/UserStore/UserStore';

interface IframeAppProps {
  appName: string;
  getLoginScript: (username: string, webdavKey: string) => string;
  logoutScript: string;
}

const NativeIframeWithScripts: React.FC<IframeAppProps> = ({ appName, getLoginScript, logoutScript }) => {
  const { user, getWebdavKey } = useUserStore();
  const [loginScript, setLoginScript] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoginScript = async () => {
      if (user) {
        const webdavKey = await getWebdavKey();
        setLoginScript(getLoginScript(user.username, webdavKey));
      }
    };

    void fetchLoginScript();
  }, [user]);

  return loginScript ? (
    <NativeIframeLayout
      scriptOnStartUp={loginScript}
      scriptOnStop={logoutScript}
      appName={appName}
    />
  ) : null;
};

export default NativeIframeWithScripts;
