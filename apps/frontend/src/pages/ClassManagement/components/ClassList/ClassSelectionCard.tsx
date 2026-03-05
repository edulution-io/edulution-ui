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

import React, { useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { Card, CardContent } from '@/components/shared/Card';
import { cn } from '@edulution-io/ui-kit';
import Checkbox from '@/components/ui/Checkbox';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';

interface ClassSelectionCardProps {
  group: LmnApiSchoolClass;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  disabled?: boolean;
  onPdfClick: (event: React.MouseEvent, group: LmnApiSchoolClass) => void;
  onCsvClick: (event: React.MouseEvent, group: LmnApiSchoolClass) => void;
}

const ClassSelectionCard = ({
  selectedClasses,
  setSelectedClasses,
  group,
  disabled,
  onPdfClick,
  onCsvClick,
}: ClassSelectionCardProps) => {
  const { user } = useLmnApiStore();
  const { displayName, cn: commonName, sophomorixSchoolname } = group;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  const isSelected = !!selectedClasses.find((s) => s.dn === group.dn);

  const toggleIsSelected = () => {
    if (disabled) return;

    if (isSelected) {
      setSelectedClasses((prev) => prev.filter((p) => p.dn !== group.dn));
    } else {
      setSelectedClasses((prev) => [...prev, group]);
    }
  };

  const isActive = isSelected || isHovered;

  return (
    <Card
      key={group.dn}
      variant="text"
      className={cn(
        'h-13 my-2 ml-1 mr-8 flex w-64 min-w-64 overflow-hidden ',
        isActive && 'scale-105',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
      onClick={toggleIsSelected}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="relative flex w-full flex-row p-0">
        <div className="m-0 flex w-5/6 flex-col justify-between ">
          <div className="flew-row flex ">
            <Checkbox
              className="ml-2 rounded-lg"
              checked={isSelected}
              onCheckedChange={toggleIsSelected}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
            <TooltipProvider>
              <ActionTooltip
                tooltipText={displayName || commonName}
                trigger={
                  <div className="ml-2 text-nowrap text-lg font-bold">
                    {displayName || removeSchoolPrefix(commonName, user.school)}
                  </div>
                }
              />
            </TooltipProvider>
          </div>

          <div className="-mt-2 ml-2 text-sm">{sophomorixSchoolname}</div>
        </div>
        <button
          type="button"
          onClick={(event) => onPdfClick(event, group)}
          className="absolute -top-[1px] right-9 h-[42px] bg-primary px-2 text-xl hover:bg-opacity-90"
        >
          <FontAwesomeIcon
            icon={faFilePdf}
            className="text-white"
          />
        </button>
        <button
          type="button"
          onClick={(event) => onCsvClick(event, group)}
          className="absolute -right-0 -top-[1px] h-[42px] rounded-r-lg bg-primary px-2 text-lg hover:bg-opacity-90"
        >
          <FontAwesomeIcon
            icon={faFileCsv}
            className="text-white"
          />
        </button>
      </CardContent>
    </Card>
  );
};

export default ClassSelectionCard;
