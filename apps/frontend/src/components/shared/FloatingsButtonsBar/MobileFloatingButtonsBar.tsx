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
