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
/*
 * LICENSE … (wie gehabt)
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Button } from '@/components/shared/Button';

import downloadPublicFile from '@libs/filesharing/utils/downloadPublicFile';
import buildAbsolutePublicDownloadUrl from '@libs/filesharing/utils/buildAbsolutePublicDownloadUrl';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';

import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useUserStore from '@/store/UserStore/UserStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import PublicShareMetaList from '../publicPage/components/PublicShareMetaList';
import DownloadPublicFileButton from '../publicPage/components/DownloadPublicShare';
import PublicSharePasswordInput from '../publicPage/components/PublicSharePasswordInput';
import FileHeader from '../publicPage/components/PublicShareHeader';

const schema = z.object({ password: z.string().optional() });
type FormValues = z.infer<typeof schema>;

const DownloadPublicShareDialog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDownloading, setIsDownloading] = useState(false);

  const { eduApiToken } = useUserStore();

  const isAuthenticated = Boolean(eduApiToken);

  const { isPublicShareInfoDialogOpen, closePublicShareDialog, publicShareId } = usePublicSharePageStore();

  const { fetchPublicShareContentById, publicShareContent, isPasswordRequired, isAccessRestricted } =
    usePublicShareStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!publicShareId) return;
    void fetchPublicShareContentById(publicShareId);
  }, [publicShareId, fetchPublicShareContentById]);

  const onDownload = form.handleSubmit(async ({ password }) => {
    if (!publicShareContent) return;

    try {
      setIsDownloading(true);
      const { filename, fileLink } = publicShareContent;
      const absoluteUrl = buildAbsolutePublicDownloadUrl(fileLink);

      await downloadPublicFile(
        absoluteUrl,
        filename,
        password,
        () =>
          form.setError('password', {
            type: 'server',
            message: t('filesharing.publicFileSharing.errors.PublicFileWrongPassword'),
          }),
        eduApiToken,
      );
    } finally {
      setIsDownloading(false);
    }
  });

  const handleClose = () => closePublicShareDialog();

  if (isAccessRestricted) {
    const restrictedBody = (
      <div className="space-y-6 text-center">
        <h3 className="text-xl font-semibold">{t('filesharing.publicFileSharing.errors.PublicFileIsRestricted')}</h3>

        {!isAuthenticated && (
          <Button
            className="mx-auto w-52 justify-center shadow-xl"
            variant="btn-security"
            size="lg"
            onClick={() => navigate(LOGIN_ROUTE, { state: { from: location.pathname } })}
          >
            {t('common.toLogin')}
          </Button>
        )}
      </div>
    );

    return (
      <AdaptiveDialog
        isOpen={isAuthenticated ? isPublicShareInfoDialogOpen : true}
        handleOpenChange={isAuthenticated ? closePublicShareDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={restrictedBody}
        footer={null}
      />
    );
  }

  if (!publicShareContent) {
    return (
      <AdaptiveDialog
        isOpen={isAuthenticated ? isPublicShareInfoDialogOpen : true}
        handleOpenChange={isAuthenticated ? closePublicShareDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={<h3 className="text-xl font-semibold">{t('filesharing.publicFileSharing.errors.PublicFileNotFound')}</h3>}
      />
    );
  }

  const { filename, creator, expires } = publicShareContent;

  const accessBody = (
    <div className="space-y-4">
      <FileHeader
        filename={filename}
        creator={creator}
      />

      {isPasswordRequired && (
        <FormProvider {...form}>
          <PublicSharePasswordInput placeholder={t('conferences.password')} />
        </FormProvider>
      )}

      <DownloadPublicFileButton
        onClick={onDownload}
        isLoading={isDownloading}
        label={t('filesharing.publicFileSharing.downloadPublicFile')}
      />

      <PublicShareMetaList expires={expires} />
    </div>
  );

  const footer = (
    <DialogFooterButtons
      handleClose={handleClose}
      hideSubmitButton
    />
  );

  return (
    <>
      {isDownloading && <LoadingIndicatorDialog isOpen />}

      <AdaptiveDialog
        isOpen={isAuthenticated ? isPublicShareInfoDialogOpen : true}
        handleOpenChange={isAuthenticated ? closePublicShareDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={accessBody}
        footer={isAuthenticated ? footer : null}
      />
    </>
  );
};

export default DownloadPublicShareDialog;
