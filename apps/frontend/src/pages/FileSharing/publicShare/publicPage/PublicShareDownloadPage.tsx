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
import useUserStore from '@/store/UserStore/UserStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePublicShareStore } from '@/pages/FileSharing/publicShare/usePublicShareStore';
import DownloadPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DownloadPublicShareDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import APPS from '@libs/appconfig/constants/apps';

const PublicShareDownloadPage: React.FC = () => {
  const { eduApiToken } = useUserStore();
  const { setOpenPublicShareDialog } = usePublicSharePageStore();

  const navigate = useNavigate();
  const { fetchPublicShareContentById, isLoading } = usePublicShareStore();

  const location = useLocation();
  const id = location.pathname.split('/').pop() ?? '';

  useEffect(() => {
    if (!id) return;
    if (eduApiToken) {
      setOpenPublicShareDialog(id);
      navigate(`/${APPS.FILE_SHARING}`);
    } else {
      void fetchPublicShareContentById(id);
    }
  }, [id, eduApiToken]);

  let content: React.ReactNode;

  if (isLoading) {
    content = <LoadingIndicatorDialog isOpen={isLoading} />;
  } else {
    content = <DownloadPublicShareDialog />;
  }

  return (
    <PageLayout>
      <div className="items-center rounded-xl  p-8">{content}</div>
    </PageLayout>
  );
};

export default PublicShareDownloadPage;
