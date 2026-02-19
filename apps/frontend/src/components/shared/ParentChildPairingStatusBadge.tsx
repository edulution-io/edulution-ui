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
import { cn } from '@edulution-io/ui-kit';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import { BadgeSH } from '@/components/ui/BadgeSH';

const PARENT_CHILD_PAIRING_STATUS_STYLES: Record<string, string> = {
  [PARENT_CHILD_PAIRING_STATUS.PENDING]: 'bg-yellow-500 text-white',
  [PARENT_CHILD_PAIRING_STATUS.ACCEPTED]: 'bg-ciLightGreen text-white',
  [PARENT_CHILD_PAIRING_STATUS.REJECTED]: 'bg-ciRed text-white',
};

const PARENT_CHILD_PAIRING_STATUS_TRANSLATIONS: Record<string, string> = {
  [PARENT_CHILD_PAIRING_STATUS.PENDING]: 'parentChildPairing.statusPending',
  [PARENT_CHILD_PAIRING_STATUS.ACCEPTED]: 'parentChildPairing.statusAccepted',
  [PARENT_CHILD_PAIRING_STATUS.REJECTED]: 'parentChildPairing.statusRejected',
};

interface ParentChildPairingStatusBadgeProps {
  status: string;
  className?: string;
}

const ParentChildPairingStatusBadge: React.FC<ParentChildPairingStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  const style = PARENT_CHILD_PAIRING_STATUS_STYLES[status] ?? 'bg-gray-500 text-white';
  const translationKey = PARENT_CHILD_PAIRING_STATUS_TRANSLATIONS[status] ?? status;

  return <BadgeSH className={cn('!h-auto !py-0 text-sm', style, className)}>{t(translationKey)}</BadgeSH>;
};

export default ParentChildPairingStatusBadge;
