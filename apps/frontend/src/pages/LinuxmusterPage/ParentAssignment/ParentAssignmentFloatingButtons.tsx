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
import { faCheck, faBan } from '@fortawesome/free-solid-svg-icons';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import useParentAssignmentStore from './useParentAssignmentStore';

const ParentAssignmentFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const { selectedRows, pairings, updateStatusBulk } = useParentAssignmentStore();

  const selectedIds = Object.keys(selectedRows);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleBulkAccept = () => {
    void updateStatusBulk(selectedIds, PARENT_CHILD_PAIRING_STATUS.ACCEPTED);
  };

  const handleBulkReject = () => {
    void updateStatusBulk(selectedIds, PARENT_CHILD_PAIRING_STATUS.REJECTED);
  };

  const hasNonAccepted = selectedIds.some((id) => {
    const pairing = pairings.find((p) => p.id === id);
    return pairing?.status !== PARENT_CHILD_PAIRING_STATUS.ACCEPTED;
  });

  const hasNonRejected = selectedIds.some((id) => {
    const pairing = pairings.find((p) => p.id === id);
    return pairing?.status !== PARENT_CHILD_PAIRING_STATUS.REJECTED;
  });

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faCheck,
        text: t('parentChildPairing.accept'),
        onClick: handleBulkAccept,
        isVisible: hasNonAccepted,
      },
      {
        icon: faBan,
        text: t('parentChildPairing.reject'),
        onClick: handleBulkReject,
        isVisible: hasNonRejected,
      },
    ],
    keyPrefix: 'parent-assignment-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default ParentAssignmentFloatingButtons;
