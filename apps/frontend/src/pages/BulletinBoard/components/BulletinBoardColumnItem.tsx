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
import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { PiCaretRightBold, PiDotsThreeVerticalBold } from 'react-icons/pi';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { useParams } from 'react-router-dom';
import cn from '@libs/common/utils/className';
import BulletinContent from '@/pages/BulletinBoard/components/BulletinContent/BulletinContent';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';

const COLLAPSE_HEIGHT = 100;
const CLAMP_CLASSES_WHEN_COLLAPSED: Record<BulletinVisibilityStatesType, string> = {
  FULLY_VISIBLE: 'hidden',
  PREVIEW: 'max-h-[100px] overflow-hidden',
  ONLY_TITLE: 'hidden',
};

const BulletinBoardColumnItem = ({
  bulletin,
  canManageBulletins,
  handleImageClick,
  bulletinVisibility,
}: {
  bulletin: BulletinResponseDto;
  canManageBulletins: boolean;
  handleImageClick: (imageUrl: string) => void;
  bulletinVisibility?: BulletinVisibilityStatesType;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

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
  const {
    resetBulletinBoardNotifications,
    setIsEditorialModeEnabled,
    collapsedMap,
    setCollapsed,
    toggleCollapsed,
    overflowMap,
    setOverflowing,
  } = useBulletinBoardStore();

  const isOverflowing = overflowMap[bulletin.id] ?? false;
  const collapsed = Object.prototype.hasOwnProperty.call(collapsedMap, bulletin.id)
    ? collapsedMap[bulletin.id]
    : bulletinVisibility === BULLETIN_VISIBILITY_STATES.PREVIEW && isOverflowing;

  useEffect(() => {
    if (bulletinId !== bulletin.id) return undefined;

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
    setSelectedRows({ [bulletin.id]: true });
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

  useEffect(() => {
    if (bulletinVisibility !== BULLETIN_VISIBILITY_STATES.PREVIEW || !contentRef.current) {
      return undefined;
    }
    const el = contentRef.current;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const isCurrentlyOverflowing = entry.target.scrollHeight > COLLAPSE_HEIGHT;

      setOverflowing(bulletin.id, isCurrentlyOverflowing);

      if (isCurrentlyOverflowing) {
        observer.disconnect();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [bulletin.id, bulletinVisibility, setOverflowing]);

  const clampClass = useMemo(() => {
    if (!collapsed || !bulletinVisibility) return '';

    if (bulletinVisibility === BULLETIN_VISIBILITY_STATES.PREVIEW && !isOverflowing) {
      return CLAMP_CLASSES_WHEN_COLLAPSED[BULLETIN_VISIBILITY_STATES.ONLY_TITLE];
    }

    return CLAMP_CLASSES_WHEN_COLLAPSED[bulletinVisibility];
  }, [bulletinVisibility, collapsed, isOverflowing]);

  return (
    <div
      id={bulletin.id}
      className={cn(
        'relative mx-1 flex items-start justify-between break-all rounded-lg bg-ciDarkGreyDisabled p-4 pb-2',
        {
          ring: bulletinId === bulletin.id,
        },
      )}
    >
      <div className="flex-1">
        <h4 className="w-[calc(100%-20px)] break-normal">
          <button
            type="button"
            className="flex items-start space-x-2 text-left hover:opacity-75"
            onClick={() => toggleCollapsed(bulletin.id)}
          >
            <PiCaretRightBold
              className={cn('mt-1 h-3 w-3 flex-shrink-0 transition-transform duration-200', {
                'rotate-90': !collapsed,
              })}
            />
            <span className="break-words text-lg font-bold leading-tight text-background">{bulletin.title}</span>
          </button>
        </h4>

        <div className="quill-content relative mt-2 break-normal text-background">
          <div
            ref={contentRef}
            className={cn(clampClass, 'transition-[max-height] duration-300 ease-in-out')}
            style={{
              maxHeight: collapsed ? `${COLLAPSE_HEIGHT}px` : `${contentRef.current?.scrollHeight || 100}px`,
            }}
          >
            <BulletinContent
              html={bulletin.content}
              handleImageClick={handleImageClick}
            />

            {getAuthorDescription()}
          </div>

          {collapsed && isOverflowing && bulletinVisibility === BULLETIN_VISIBILITY_STATES.PREVIEW && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-t from-ciDarkGreyDisabled to-transparent" />
              <Button
                size="sm"
                variant="btn-transparent"
                onClick={() => setCollapsed(bulletin.id, false)}
              >
                {t('common.showMore')}
              </Button>
            </>
          )}
        </div>
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
