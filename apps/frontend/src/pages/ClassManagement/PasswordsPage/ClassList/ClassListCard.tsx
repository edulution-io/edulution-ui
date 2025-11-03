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

import React, { useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';
import { Card, CardContent } from '@/components/shared/Card';
import cn from '@libs/common/utils/className';
import Checkbox from '@/components/ui/Checkbox';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { FaFileCsv, FaRegFilePdf } from 'react-icons/fa6';
import PrintPasswordsDialog from '@/pages/ClassManagement/PasswordsPage/PrintPasswordsDialog';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';

interface ClassListCardProps {
  group: LmnApiSchoolClass;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  disabled?: boolean;
}

const ClassListCard = ({ selectedClasses, setSelectedClasses, group, disabled }: ClassListCardProps) => {
  const { user } = useLmnApiStore();
  const { displayName, cn: commonName, sophomorixSchoolname } = group;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [classToPrint, setClassToPrint] = useState<LmnApiSchoolClass | null>(null);
  const [formatToPrint, setFormatToPrint] = useState<PrintPasswordsFormat | null>(null);

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

  const onButtonClick = (event: React.MouseEvent, format: PrintPasswordsFormat) => {
    event.stopPropagation();
    setFormatToPrint(format);
    setClassToPrint(group);
  };

  const onSelect = () => {
    toggleIsSelected();
  };

  const isActive = isSelected || isHovered;

  return (
    <>
      <Card
        key={group.dn}
        variant="text"
        className={cn(
          'h-13 my-2 ml-1 mr-8 flex w-64 min-w-64 overflow-hidden ',
          isActive && 'scale-105',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
        onClick={onSelect}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <CardContent className="relative flex w-full flex-row p-0">
          <div className="m-0 flex w-5/6 flex-col justify-between ">
            <div className="flew-row flex ">
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isSelected}
                onCheckedChange={onSelect}
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
            onClick={(event) => onButtonClick(event, PrintPasswordsFormat.PDF)}
            className="absolute -top-[1px] right-9 h-[42px] bg-primary px-2 py-3 text-xl hover:bg-opacity-90"
          >
            <FaRegFilePdf />
          </button>
          <button
            type="button"
            onClick={(event) => onButtonClick(event, PrintPasswordsFormat.CSV)}
            className="absolute -right-0 -top-[1px] h-[42px] rounded-r-lg bg-primary px-2 py-3 text-lg hover:bg-opacity-90"
          >
            <FaFileCsv />
          </button>
        </CardContent>
      </Card>

      {classToPrint && formatToPrint ? (
        <PrintPasswordsDialog
          title={formatToPrint}
          selectedClasses={[classToPrint]}
          onClose={() => {
            setClassToPrint(null);
            setFormatToPrint(null);
          }}
        />
      ) : null}
    </>
  );
};

export default ClassListCard;
