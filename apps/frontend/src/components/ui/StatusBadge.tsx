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

import StatusVariant from '@libs/common/types/statusVariant';
import React from 'react';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500/20 text-green-400',
  error: 'bg-red-500/20 text-red-400',
  default: 'bg-ciLightGrey/20 text-ciLightGrey',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-400',
  error: 'bg-red-400',
  default: 'bg-ciLightGrey',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${variantStyles[variant]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotStyles[variant]}`} />
      {children}
    </span>
  );

export default StatusBadge;
