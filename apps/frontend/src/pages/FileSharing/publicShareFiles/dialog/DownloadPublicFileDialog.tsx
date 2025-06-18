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

import React, { useEffect } from 'react';
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

import usePublicShareFilePageStore from '@/pages/FileSharing/publicShareFiles/publicPage/usePublicShareFilePageStore';
import usePublicShareFilesStore from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import useUserStore from '@/store/UserStore/UserStore';
import FileMetaList from '../publicPage/components/FileMetaList';
import DownloadPublicFileButton from '../publicPage/components/DownloadPublicFile';
import PublicFilePasswordInput from '../publicPage/components/PublicFilePasswordInput';
import FileHeader from '../publicPage/components/FileHeader';

const schema = z.object({ password: z.string().optional() });
type FormValues = z.infer<typeof schema>;

const DownloadPublicFileDialog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { eduApiToken } = useUserStore();

  const isAuthenticated = Boolean(eduApiToken);

  const { openShareInfoDialog, closeDialog, shareId } = usePublicShareFilePageStore();

  const { fetchPublicShareFilesById, publicShareFile, isPasswordRequired, isAccessRestricted } =
    usePublicShareFilesStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!shareId) return;
    void fetchPublicShareFilesById(shareId, eduApiToken);
  }, [shareId, fetchPublicShareFilesById]);

  const onDownload = form.handleSubmit(async ({ password }) => {
    if (!publicShareFile) return;

    const { filename, fileLink } = publicShareFile;
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
  });

  const handleClose = () => closeDialog();

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
        isOpen={isAuthenticated ? openShareInfoDialog : true}
        handleOpenChange={isAuthenticated ? closeDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={restrictedBody}
        footer={null}
      />
    );
  }

  if (!publicShareFile) {
    return (
      <AdaptiveDialog
        isOpen={isAuthenticated ? openShareInfoDialog : true}
        handleOpenChange={isAuthenticated ? closeDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={<h3 className="text-xl font-semibold">{t('filesharing.publicFileSharing.errors.PublicFileNotFound')}</h3>}
      />
    );
  }

  const { filename, creator, expires } = publicShareFile;

  const accessBody = (
    <div className="space-y-4">
      <FileHeader
        filename={filename}
        creator={creator}
      />

      {isPasswordRequired && (
        <FormProvider {...form}>
          <PublicFilePasswordInput placeholder={t('conferences.password')} />
        </FormProvider>
      )}

      <DownloadPublicFileButton
        onClick={onDownload}
        label={t('filesharing.publicFileSharing.downloadPublicFile')}
      />

      <FileMetaList expires={expires} />
    </div>
  );

  const footer = (
    <DialogFooterButtons
      handleClose={handleClose}
      hideSubmitButton
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isAuthenticated ? openShareInfoDialog : true}
      handleOpenChange={isAuthenticated ? closeDialog : () => {}}
      title={t('filesharing.publicFileSharing.downloadPublicFile')}
      body={accessBody}
      footer={isAuthenticated ? footer : null}
    />
  );
};

export default DownloadPublicFileDialog;
