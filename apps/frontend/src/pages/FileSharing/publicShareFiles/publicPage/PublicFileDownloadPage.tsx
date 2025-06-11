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

import PageLayout from '@/components/structure/layout/PageLayout';
import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import useUserStore from '@/store/UserStore/UserStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import PublicFileDownloadInfo from '@/pages/FileSharing/publicShareFiles/publicPage/PublicFileDownloadInfo';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import usePublicShareFilePageStore from '@/pages/FileSharing/publicShareFiles/publicPage/usePublicShareFilePageStore';
import APPS from '@libs/appconfig/constants/apps';

const PublicFileDownloadPage: React.FC = () => {
  const { eduApiToken } = useUserStore();
  const { openDialog } = usePublicShareFilePageStore();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchPublicShareFilesById, publicShareFile, isAccessRestricted, isFileAvailable, isLoading } =
    usePublicShareFilesStore();

  const location = useLocation();
  const id = location.pathname.split('/').pop() ?? '';

  useEffect(() => {
    if (!id) return;
    if (eduApiToken) {
      openDialog(id);
      navigate(`/${APPS.FILE_SHARING}`);
    } else {
      void fetchPublicShareFilesById(id, eduApiToken);
    }
  }, [id, eduApiToken]);

  let content: React.ReactNode = null;

  if (isLoading) {
    content = <LoadingIndicatorDialog isOpen={isLoading} />;
  } else if (publicShareFile) {
    content = <PublicFileDownloadInfo />;
  } else if (isAccessRestricted) {
    content = (
      <div className="space-y-6 text-center">
        <h3 className="text-xl font-semibold">{t('common.restrictedAccess')}</h3>

        <Button
          className="mx-auto w-52 justify-center shadow-xl"
          variant="btn-security"
          size="lg"
          onClick={() => navigate(LOGIN_ROUTE, { state: { from: location.pathname } })}
        >
          {t('common.toLogin')}
        </Button>
      </div>
    );
  } else if (!isFileAvailable) {
    content = <h3 className="text-center text-xl font-semibold">{t('common.fileNotFound')}</h3>;
  }

  return (
    <PageLayout>
      <div className="items-center rounded-xl  p-8">{content}</div>
    </PageLayout>
  );
};

export default PublicFileDownloadPage;
