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
import { t } from 'i18next';
import Progress from '@/components/ui/Progress';

interface ProgressBoxProps {
  percent: number;
  title?: string;
  description?: string;
  statusDescription?: string;
  id: string | number;
  failed?: number;
  processed?: number;
  total?: number;
}

const ProgressBox: React.FC<{ data: ProgressBoxProps }> = ({ data }) => {
  const { percent, title, description, statusDescription, failed, processed, total } = data;

  return (
    <div className="flex flex-col gap-2">
      {title && <h1 className="text-sm font-bold">{title}</h1>}

      <div className="flex items-center gap-2">
        <Progress value={percent} />
        <span className="whitespace-nowrap text-sm text-background">{percent}%</span>
      </div>

      {description && <p className="text-sm text-background">{description}</p>}

      {statusDescription && (
        <p className="text-sm text-background">
          {t(statusDescription, {
            processed: (processed || 0) - (failed || 0),
            total,
          })}
        </p>
      )}
    </div>
  );
};

export default ProgressBox;
