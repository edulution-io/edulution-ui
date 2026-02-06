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
import VIEW_MODE from '@libs/common/constants/viewMode';
import ViewModeType from '@libs/common/types/viewModeType';
import { cn , Button } from '@edulution-io/ui-kit';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faList } from '@fortawesome/free-solid-svg-icons';

interface ViewModeToggleProps {
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
  isDialog?: boolean;
}

const ViewModeToggle = ({ viewMode, onViewModeChange, isDialog = false }: ViewModeToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center rounded-lg border border-accent">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="btn-ghost"
            size="icon"
            onClick={() => onViewModeChange(VIEW_MODE.table)}
            className={cn(
              'rounded-r-none',
              viewMode === VIEW_MODE.table && (isDialog ? 'bg-ciLightGrey' : 'bg-accent'),
            )}
          >
            <FontAwesomeIcon
              icon={faList}
              className="h-4 w-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('common.tableView')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="btn-ghost"
            size="icon"
            onClick={() => onViewModeChange(VIEW_MODE.grid)}
            className={cn(
              'h-[38px] w-[38px] rounded-l-none',
              viewMode === VIEW_MODE.grid && (isDialog ? 'bg-ciLightGrey' : 'bg-accent'),
            )}
          >
            <FontAwesomeIcon
              icon={faGrip}
              className="h-4 w-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('common.gridView')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ViewModeToggle;
