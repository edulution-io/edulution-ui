/* eslint-disable react/no-danger */
import React, { useMemo } from 'react';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import cn from '@libs/common/utils/className';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '@/components/shared/DropdownMenu';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import DeleteBulletinsDialog from '@/pages/BulletinBoardEditorial/DeleteBulletinsDialog';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import { RowSelectionState } from '@tanstack/react-table';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { useNavigate } from 'react-router-dom';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APPS from '@libs/appconfig/constants/apps';
import useLdapGroups from '@/hooks/useLdapGroups';
import { DropdownMenuItemType } from '@libs/ui/types/dropdownMenuItemType';
import useUserStore from '@/store/UserStore/UserStore';

const BulletinBoardPageColumn = ({
  bulletins,
  categoryCount,
  category,
  canEditCategory,
  canManageBulletins,
}: {
  categoryCount: number;
  category: BulletinCategoryResponseDto;
  bulletins: BulletinResponseDto[];
  canEditCategory: boolean;
  canManageBulletins: boolean;
}) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { isSuperAdmin } = useLdapGroups();
  const { setSelectedRows, setIsDeleteBulletinDialogOpen, setIsCreateBulletinDialogOpen, setSelectedBulletinToEdit } =
    useBulletinBoardEditorialStore();
  const { getBulletinsByCategories } = useBulletinBoardStore();

  const handleDeleteBulletin = (bulletin: BulletinResponseDto) => {
    const rowSelectionState: RowSelectionState = { [bulletin.id]: true };
    setSelectedRows(rowSelectionState);
    setIsDeleteBulletinDialogOpen(true);
  };

  const handleEditBulletin = (bulletin: BulletinResponseDto) => {
    setSelectedBulletinToEdit(bulletin);
    setIsCreateBulletinDialogOpen(true);
  };

  const handleCreateBulletin = (categoryForCreation: BulletinCategoryResponseDto) => {
    setSelectedBulletinToEdit({ category: categoryForCreation } as BulletinResponseDto);
    setIsCreateBulletinDialogOpen(true);
  };

  const getAuthorDescription = (bulletin: BulletinResponseDto) => {
    const isCreatorLastUpdater = bulletin.creator.username === bulletin.updatedBy?.username || !bulletin.updatedBy;
    const translationId = isCreatorLastUpdater ? 'bulletinboard.createdFrom' : 'bulletinboard.createdFromAndUpdatedBy';
    return (
      <div className="mt-2 text-right text-sm italic text-muted-foreground">
        {t(translationId, {
          createdBy: `${bulletin.creator.firstName} ${bulletin.creator.lastName}`,
          lastUpdatedBy: `${bulletin.updatedBy?.firstName} ${bulletin.updatedBy?.lastName}`,
          lastUpdated: new Date(bulletin.updatedAt).toLocaleString(undefined, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        })}
      </div>
    );
  };

  const getCategoryDropdownItems = useMemo(() => {
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

  const getBulletinDropdownItems = (bulletin: BulletinResponseDto) => {
    const items: DropdownMenuItemType[] = [];
    const isUserTheCreator = user?.username === bulletin.creator.username;

    if (isSuperAdmin || isUserTheCreator) {
      items.push(
        {
          label: t('bulletinboard.editBulletin'),
          onClick: () => handleEditBulletin(bulletin),
        },
        {
          label: t('bulletinboard.deleteBulletin'),
          onClick: () => handleDeleteBulletin(bulletin),
        },
        { label: 'bulletinSeparator', isSeparator: true },
      );
    }
    if (canManageBulletins) {
      items.push({
        label: t('bulletinboard.manageBulletins'),
        onClick: () => navigate(`/${APPS.BULLETIN_BOARD}`),
      });
    }
    return items;
  };

  return (
    <div
      className={cn('flex h-full w-full min-w-[300px] flex-shrink-0 flex-col rounded-lg px-2 md:ml-0 md:p-3', {
        'w-1/2': categoryCount === 2,
        'w-1/3': categoryCount === 3,
        'w-[300px]': categoryCount >= 4,
      })}
    >
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
          items={getCategoryDropdownItems}
        />
      </Card>
      <div className="flex flex-col gap-4 overflow-y-auto pb-20 text-white">
        {bulletins.map((bulletin) => (
          <div
            key={bulletin.id}
            className="relative flex items-center justify-between break-all rounded-lg bg-white bg-opacity-5 p-4"
          >
            <div className="flex-1">
              <h4 className="truncate text-lg font-bold text-white">{bulletin.title}</h4>
              <div
                className="mt-2 text-gray-100"
                dangerouslySetInnerHTML={{ __html: bulletin.content }}
              />
              {getAuthorDescription(bulletin)}
            </div>
            <DropdownMenu
              trigger={
                <Button
                  type="button"
                  className="text-white-500 absolute right-2 top-2 ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full p-1 hover:bg-blue-600 hover:text-white"
                  title={t('common.options')}
                >
                  <PiDotsThreeVerticalBold className="h-6 w-6" />
                </Button>
              }
              items={getBulletinDropdownItems(bulletin)}
            />
          </div>
        ))}
      </div>

      <CreateOrUpdateBulletinDialog onSubmit={getBulletinsByCategories} />
      <DeleteBulletinsDialog onSubmit={getBulletinsByCategories} />
    </div>
  );
};

export default BulletinBoardPageColumn;