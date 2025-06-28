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
import { useTranslation } from 'react-i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { Button } from '@/components/shared/Button';

import buildAbsolutePublicDownloadUrl from '@libs/filesharing/utils/buildAbsolutePublicDownloadUrl';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';

import usePublicSharePageStore from '@/pages/FileSharing/publicShare/publicPage/usePublicSharePageStore';
import useUserStore from '@/store/UserStore/UserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { ArrowDownToLine } from 'lucide-react';
import PublicSharePasswordInput from '../publicPage/components/PublicSharePasswordInput';
import PublicShareMetaDetails from '../publicPage/components/PublicShareMetaDetails';
import usePublicShareStore from '../usePublicShareStore';

const schema = z.object({ password: z.string().optional() });
type FormValues = z.infer<typeof schema>;

interface DownloadPublicShareDialogProps {
  publicOpened?: boolean;
}

const DownloadPublicShareDialog: React.FC<DownloadPublicShareDialogProps> = ({ publicOpened }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, eduApiToken } = useUserStore();

  const { isPublicShareInfoDialogOpen, closePublicShareDialog, publicShareId } = usePublicSharePageStore();

  const { downloadFileWithPassword, fetchedShareByIdResult, fetchShareById } = usePublicShareStore();

  const { isAccessRestricted, requiresPassword, publicShare } = fetchedShareByIdResult;

  const share = publicShare && Array.isArray(publicShare) ? publicShare[0] : publicShare;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!publicShareId || publicOpened) return;
    void fetchShareById(publicShareId);
  }, [publicShareId]);

  const onDownload = form.handleSubmit(async ({ password }) => {
    if (!share) return;

    const { filename } = share;
    const absoluteUrl = buildAbsolutePublicDownloadUrl(
      `${EDU_API_ROOT}/${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE_DOWNLOAD}/${publicShareId}`,
    );
    await downloadFileWithPassword(
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

  if (!share) {
    return (
      <AdaptiveDialog
        isOpen={isAuthenticated ? isPublicShareInfoDialogOpen : true}
        handleOpenChange={isAuthenticated ? closePublicShareDialog : () => {}}
        title={t('filesharing.publicFileSharing.downloadPublicFile')}
        body={<h3 className="text-xl font-semibold">{t('filesharing.publicFileSharing.errors.PublicFileNotFound')}</h3>}
      />
    );
  }

  const { filename, creator, expires } = share;

  const accessBody = (
    <div className="space-y-4">
      <PublicShareMetaDetails
        filename={filename}
        creator={creator}
        expires={expires}
      />

      {requiresPassword && (
        <FormProvider {...form}>
          <PublicSharePasswordInput
            placeholder={t('conferences.password')}
            form={form}
          />
        </FormProvider>
      )}

      <Button
        onClick={onDownload}
        variant="btn-security"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl"
      >
        <ArrowDownToLine className="h-5 w-5" />
        {t('filesharing.publicFileSharing.downloadPublicFile')}
      </Button>
    </div>
  );

  const footer = <DialogFooterButtons handleClose={handleClose} />;

  return (
    <AdaptiveDialog
      isOpen={isAuthenticated ? isPublicShareInfoDialogOpen : true}
      handleOpenChange={isAuthenticated ? closePublicShareDialog : () => {}}
      title={t('filesharing.publicFileSharing.downloadPublicFile')}
      body={accessBody}
      footer={isAuthenticated ? footer : null}
    />
  );
};

export default DownloadPublicShareDialog;
