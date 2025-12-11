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
