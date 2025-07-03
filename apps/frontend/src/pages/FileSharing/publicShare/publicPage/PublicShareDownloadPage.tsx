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
import { useNavigate, useParams } from 'react-router-dom';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import DownloadPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DownloadPublicShareDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import APPS from '@libs/appconfig/constants/apps';
import PageTitle from '@/components/PageTitle';

const PublicShareDownloadPage: React.FC = () => {
  const { eduApiToken } = useUserStore();
  const { setOpenPublicShareDialog } = usePublicSharePageStore();
  const { setPublicShareId } = usePublicSharePageStore();

  const navigate = useNavigate();
  const { fetchShareById, isLoading } = usePublicShareStore();

  const { fileId } = useParams<{ fileId: string }>();

  useEffect(() => {
    if (fileId) {
      setPublicShareId(fileId);
    }
  }, [fileId, setPublicShareId]);

  useEffect(() => {
    if (!fileId) return;
    if (eduApiToken) {
      setOpenPublicShareDialog(fileId);
      navigate(`/${APPS.FILE_SHARING}`);
    } else {
      void fetchShareById(fileId);
    }
  }, [fileId, eduApiToken]);

  return (
    <>
      <PageTitle translationId="filesharing.publicFileSharing.downloadPublicFile" />
      <PageLayout>
        <div className="flex justify-center p-8">
          {isLoading ? <LoadingIndicatorDialog isOpen /> : <DownloadPublicShareDialog publicOpened />}
        </div>
      </PageLayout>
    </>
  );
};

export default PublicShareDownloadPage;
