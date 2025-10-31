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

import React, { useMemo, useState } from 'react';
import { HiOutlineChevronDoubleDown, HiOutlineChevronDoubleUp } from 'react-icons/hi';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';
import { Button } from '@/components/shared/Button';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { IconContext } from 'react-icons';
import { useTranslation } from 'react-i18next';

const MobileFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const { buttons, keyPrefix } = config;
  const floatingButtons = buttons.map((conf, index) => {
    const { icon, text, onClick, isVisible = true, variant = 'button', dropdownItems = undefined } = conf;
    return isVisible ? (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${keyPrefix}${index}`}>
        <FloatingActionButton
          variant={variant}
          icon={icon}
          text={text}
          onClick={onClick}
          dropdownItems={dropdownItems}
        />
      </div>
    ) : null;
  });

  const getDialogBody = () => <div className="flex flex-wrap justify-center px-4">{floatingButtons}</div>;

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <>
      <Button
        type="button"
        variant="btn-hexagon"
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto -translate-x-1"
        hexagonIconAltText={isOpen ? t('common.close') : t('common.open')}
      >
        <IconContext.Provider value={iconContextValue}>
          {isOpen ? <HiOutlineChevronDoubleDown /> : <HiOutlineChevronDoubleUp />}
        </IconContext.Provider>
      </Button>
      <AdaptiveDialog
        isOpen={isOpen}
        variant="secondary"
        handleOpenChange={() => setIsOpen(!isOpen)}
        title=""
        body={getDialogBody()}
        mobileContentClassName="bg-black h-fit h-max-1/2"
      />
    </>
  );
};

export default MobileFloatingButtonsBar;
