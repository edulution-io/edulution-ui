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

/* eslint-disable react/no-danger */
import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { useTranslation } from 'react-i18next';
import { RowSelectionState } from '@tanstack/react-table';
import useUserStore from '@/store/UserStore/UserStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { useParams } from 'react-router-dom';
import cn from '@libs/common/utils/className';
import BulletinContent from '@/pages/BulletinBoard/components/BulletinContent/BulletinContent';

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
  const { bulletinId } = useParams();
  const { user } = useUserStore();
  const { isSuperAdmin } = useLdapGroups();
  const {
    setSelectedRows,
    setIsDeleteBulletinDialogOpen,
    setIsCreateBulletinDialogOpen,
    setSelectedBulletinToEdit,
    getBulletins,
  } = useBulletinBoardEditorialStore();
  const { resetBulletinBoardNotifications, setIsEditorialModeEnabled } = useBulletinBoardStore();

  const isCurrentBulletin = bulletinId === bulletin.id;

  useEffect(() => {
    if (!isCurrentBulletin) return undefined;

    const element = document.getElementById(bulletinId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add('blinking');
            resetBulletinBoardNotifications();
          } else {
            element.classList.remove('blinking');
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    return undefined;
  }, [bulletinId]);

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
        onClick: () => setIsEditorialModeEnabled(true),
      });
    }
    return items;
  };

  return (
    <div
      id={bulletin.id}
      key={bulletin.id}
      className={cn('relative mx-1 flex items-center justify-between break-all rounded-lg bg-white bg-opacity-5 p-4', {
        ring: isCurrentBulletin,
      })}
    >
      <div className="flex-1">
        <h4 className="w-[calc(100%-20px)] overflow-x-hidden text-ellipsis break-normal text-lg font-bold text-background">
          {bulletin.title}
        </h4>
        <div className="quill-content mt-2 break-normal text-white">
          <BulletinContent
            html={bulletin.content}
            handleImageClick={handleImageClick}
          />
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
