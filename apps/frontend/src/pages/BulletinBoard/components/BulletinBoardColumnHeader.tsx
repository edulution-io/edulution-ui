import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { useTranslation } from 'react-i18next';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APPS from '@libs/appconfig/constants/apps';
import { Card } from '@/components/shared/Card';
import { DropdownMenuItemType } from '@libs/ui/types/dropdownMenuItemType';
import { useNavigate } from 'react-router-dom';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
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
          onClick: () => navigate(`${SETTINGS_PATH}/${APPS.BULLETIN_BOARD}`),
        },
      );
    }
    return items;
  }, [isSuperAdmin, category, t, navigate]);

  return (
    <Card
      variant="security"
      className="sticky mx-0 mb-4 flex min-h-[44px] items-center justify-between overflow-hidden rounded-lg py-1 pl-3 pr-2 opacity-90"
    >
      <h4 className="flex-1 truncate text-white">{category.name}</h4>
      <DropdownMenu
        trigger={
          <Button
            type="button"
            className="text-white-500 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full p-0 hover:bg-blue-600 hover:text-white"
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
