/* eslint-disable react/no-danger */
import React from 'react';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import { DropdownMenuItemType } from '@libs/ui/types/dropdownMenuItemType';
import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import { RowSelectionState } from '@tanstack/react-table';
import useUserStore from '@/store/UserStore/UserStore';
import { useNavigate } from 'react-router-dom';
import useLdapGroups from '@/hooks/useLdapGroups';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';

const BulletinBoardColumnItem = ({
  bulletin,
  canManageBulletins,
  handleImageClick,
}: {
  bulletin: BulletinResponseDto;
  canManageBulletins: boolean;
  handleImageClick: (imageUrl: string) => void;
}) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { isSuperAdmin } = useLdapGroups();
  const {
    setSelectedRows,
    setIsDeleteBulletinDialogOpen,
    setIsCreateBulletinDialogOpen,
    setSelectedBulletinToEdit,
    getBulletins,
  } = useBulletinBoardEditorialStore();

  const handleDeleteBulletin = async () => {
    await getBulletins();
    const rowSelectionState: RowSelectionState = { [bulletin.id]: true };
    setSelectedRows(rowSelectionState);
    setIsDeleteBulletinDialogOpen(true);
  };

  const handleEditBulletin = () => {
    setSelectedBulletinToEdit(bulletin);
    setIsCreateBulletinDialogOpen(true);
  };

  const getAuthorDescription = () => {
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

  const getBulletinDropdownItems = () => {
    const items: DropdownMenuItemType[] = [];
    const isUserTheCreator = user?.username === bulletin.creator.username;

    if (isSuperAdmin || isUserTheCreator) {
      items.push(
        {
          label: t('bulletinboard.editBulletin'),
          onClick: () => handleEditBulletin(),
        },
        {
          label: t('bulletinboard.deleteBulletin'),
          onClick: () => {
            void handleDeleteBulletin();
          },
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

  const getProcessedBulletinContent = (content: string) => {
    if (content.match(/<img[^>]*src="([^"]*)"[^>]*>/)) {
      const srcMatch = content.match(/src="([^"]*)"/);
      const src = srcMatch ? srcMatch[1] : '';
      return (
        <button
          key={`image-${content}`}
          type="button"
          className="max-w-full cursor-pointer border-none bg-transparent p-0"
          onClick={() => handleImageClick(src)}
        >
          <img
            src={src}
            alt="attachment"
            className="max-w-full"
          />
        </button>
      );
    }
    return (
      <span
        key={`text-${content}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div
      key={bulletin.id}
      className="relative flex items-center justify-between break-all rounded-lg bg-white bg-opacity-5 p-4"
    >
      <div className="flex-1">
        <h4 className="truncate text-lg font-bold text-white">{bulletin.title}</h4>
        <div className="mt-2 text-gray-100">
          {bulletin.content.split(/(<img[^>]*>)/g).map((part) => getProcessedBulletinContent(part))}
        </div>
        {getAuthorDescription()}
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
        items={getBulletinDropdownItems()}
      />
    </div>
  );
};

export default BulletinBoardColumnItem;
