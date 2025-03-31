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

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import useLmnApiStore from '@/store/useLmnApiStore';
import type UserDto from '@libs/user/types/user.dto';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { toast } from 'sonner';
import ProgressBox from '@/components/ui/ProgressBox';
import { t } from 'i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useAppConfigsStore from '../pages/Settings/AppConfig/appConfigsStore';
import useUserStore from '../store/UserStore/UserStore';
import useLogout from '../hooks/useLogout';
import useNotifications from '../hooks/useNotifications';
import useTokenEventListeners from '../hooks/useTokenEventListener';

const GlobalHooksWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const { getAppConfigs } = useAppConfigsStore();
  const { isAuthenticated, setEduApiToken, user, getWebdavKey } = useUserStore();
  const { lmnApiToken, setLmnApiToken } = useLmnApiStore();
  const { filesharingProgress } = useLessonStore();
  const { fileOperationProgress } = useFileSharingStore();
  const handleLogout = useLogout();

  useEffect(() => {
    if (auth.user?.access_token) {
      setEduApiToken(auth.user?.access_token);
    }
  }, [auth.user?.access_token]);

  useNotifications();

  useEffect(() => {
    const handleGetAppConfigs = async () => {
      const isApiResponding = await getAppConfigs();
      if (!isApiResponding) {
        void handleLogout();
      }
    };

    if (isAuthenticated) {
      void handleGetAppConfigs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleGetLmnApiKey = async (usr: UserDto) => {
      const webdavKey = await getWebdavKey();
      await setLmnApiToken(usr.username, webdavKey);
    };

    if (isAuthenticated && !lmnApiToken && user) {
      void handleGetLmnApiKey(user);
    }
  }, [isAuthenticated]);

  useTokenEventListeners();

  useEffect(() => {
    const progress = fileOperationProgress ?? filesharingProgress;
    if (!progress) return;

    const percent = progress.percent ?? 0;
    const failedCount = progress.failedPaths?.length ?? 0;
    const toasterData = {
      percent,
      title: t(progress.title),
      id: progress.currentFilePath,
      description: t(progress.description, {
        filename: progress.currentFilePath.split('/').pop(),
        studentName: progress.studentName,
      }),
      statusDescription: progress.statusDescription,
      failed: failedCount,
      processed: progress.processed,
      total: progress.total,
    };

    let toastDuration: number;
    if (toasterData.failed > 0) {
      toastDuration = Infinity;
    } else if (percent >= 100) {
      toastDuration = 5000;
    } else {
      toastDuration = Infinity;
    }

    toast(<ProgressBox data={toasterData} />, {
      id: toasterData.title,
      duration: toastDuration,
    });
  }, [filesharingProgress, fileOperationProgress]);

  return children;
};

export default GlobalHooksWrapper;
