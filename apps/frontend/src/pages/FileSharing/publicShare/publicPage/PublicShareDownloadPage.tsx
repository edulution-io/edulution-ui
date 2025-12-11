/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import PageLayout from '@/components/structure/layout/PageLayout';
import React, { useEffect } from 'react';
import useUserStore from '@/store/UserStore/useUserStore';
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
