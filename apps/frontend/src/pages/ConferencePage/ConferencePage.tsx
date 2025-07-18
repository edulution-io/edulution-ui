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

import React from 'react';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import ConferencesTable from '@/pages/ConferencePage/Table/ConferencesTable';
import ConferenceDetailsDialog from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialog';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import { ConferencesIcon } from '@/assets/icons';
import DeleteConferencesDialog from '@/pages/ConferencePage/Table/DeleteConferencesDialog';
import ConferencesFloatingButtons from '@/pages/ConferencePage/Table/ConferencesFloatingButtons';
import SharePublicQRDialog from '@/components/shared/SharePublicQRDialog';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import useSharePublicConferenceStore from '@/pages/ConferencePage/useSharePublicConferenceStore';
import PageLayout from '@/components/structure/layout/PageLayout';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

const ConferencePage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedConference } = useConferenceDetailsDialogStore();
  const { publicConferenceId, setSharePublicConferenceDialogId } = useSharePublicConferenceStore();
  const sharePublicConferenceUrl = publicConferenceId
    ? `${EDU_BASE_URL}/${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/${publicConferenceId}`
    : '';

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('conferences.sidebar'),
        description: t('conferences.description'),
        iconSrc: ConferencesIcon,
      }}
    >
      <ConferencesTable />

      <ConferencesFloatingButtons />
      <CreateConferenceDialog />
      <DeleteConferencesDialog />
      <SharePublicQRDialog
        url={sharePublicConferenceUrl}
        isOpen={!!sharePublicConferenceUrl}
        handleClose={() => setSharePublicConferenceDialogId('')}
        titleTranslationId="conferences.sharePublicDialog.title"
        descriptionTranslationId="conferences.sharePublicDialog.description"
      />
      {selectedConference ? <ConferenceDetailsDialog /> : null}
    </PageLayout>
  );
};

export default ConferencePage;
