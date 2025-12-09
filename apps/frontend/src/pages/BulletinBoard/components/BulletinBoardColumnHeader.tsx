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

import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { useTranslation } from 'react-i18next';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APPS from '@libs/appconfig/constants/apps';
import { Card } from '@/components/shared/Card';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { useNavigate } from 'react-router-dom';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useLdapGroups from '@/hooks/useLdapGroups';

const BulletinBoardColumnHeader = ({
  category,
  canEditCategory,
}: {
  category: BulletinCategoryResponseDto;
  canEditCategory: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useLdapGroups();
  const { setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } = useBulletinBoardEditorialStore();

  const handleCreateBulletin = (categoryForCreation: BulletinCategoryResponseDto) => {
    setSelectedBulletinToEdit({ category: categoryForCreation } as BulletinResponseDto);
    setIsCreateBulletinDialogOpen(true);
  };

  const categoryDropdownItems = useMemo(() => {
    const items: DropdownMenuItemType[] = [];
    if (canEditCategory) {
      items.push({ label: t('bulletinboard.createBulletin'), onClick: () => handleCreateBulletin(category) });
    }
    if (isSuperAdmin) {
      items.push(
        { label: 'categorySeparator', isSeparator: true },
        {
          label: t('bulletinboard.manageCategories'),
          onClick: () => navigate(`/${SETTINGS_PATH}/${APPS.BULLETIN_BOARD}`),
        },
      );
    }
    return items;
  }, [isSuperAdmin, category, t, navigate]);

  return (
    <Card
      variant="security"
      className="sticky mx-0 mb-4 flex h-[50px] min-h-[50px] items-center justify-between overflow-hidden py-1 pl-3 pr-2 opacity-90"
    >
      <h3 className="flex-1 truncate text-background">{category.name}</h3>
      <DropdownMenu
        trigger={
          <Button
            type="button"
            className="text-white-500 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full p-0 hover:bg-primary hover:text-white"
            title={t('common.options')}
          >
            <PiDotsThreeVerticalBold className="h-6 w-6" />
          </Button>
        }
        items={categoryDropdownItems}
      />
    </Card>
  );
};

export default BulletinBoardColumnHeader;
