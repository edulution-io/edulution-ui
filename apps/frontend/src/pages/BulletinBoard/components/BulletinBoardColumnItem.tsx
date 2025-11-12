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

/* eslint-disable react/no-danger */
import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import { useParams } from 'react-router-dom';
import cn from '@libs/common/utils/className';
import BulletinContent from '@/pages/BulletinBoard/components/BulletinContent/BulletinContent';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';

const BulletinBoardColumnItem = ({
  bulletin,
  canManageBulletins,
  handleImageClick,
  initialBulletinVisibility,
}: {
  bulletin: BulletinResponseDto;
  canManageBulletins: boolean;
  handleImageClick: (imageUrl: string) => void;
  initialBulletinVisibility?: BulletinVisibilityStatesType;
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
  const {
    collapsedMap,
    setCollapsed,
    toggleCollapsed,
    setIsEditorialModeEnabled,
    bulletinBoardNotifications,
    markBulletinAsRead,
  } = useBulletinBoardStore();

  useEffect(() => {
    if (collapsedMap[bulletin.id] === undefined) {
      const shouldBeCollapsed =
        (initialBulletinVisibility ?? BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE) !==
        BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE;
      void setCollapsed(bulletin.id, shouldBeCollapsed);
    }
  }, [bulletin.id, collapsedMap, initialBulletinVisibility, setCollapsed]);

  const isCollapsed = collapsedMap[bulletin.id];

  useEffect(() => {
    if (bulletinId !== bulletin.id) return undefined;

    const element = document.getElementById(bulletinId);

    if (!element) return undefined;

    void setCollapsed(bulletin.id, false);

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('blinking');
          markBulletinAsRead(bulletin.id);
        } else {
          element.classList.remove('blinking');
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [bulletinId]);

  useEffect(() => {
    const hasNotification = bulletinBoardNotifications.some((b) => b.id === bulletin.id);
    if (!hasNotification) return undefined;

    const element = document.getElementById(bulletin.id);
    if (!element) return undefined;

    void setCollapsed(bulletin.id, false);

    element.classList.add('blinking');

    const timer = setTimeout(() => {
      element.classList.remove('blinking');
    }, 3000);

    return () => clearTimeout(timer);
  }, [bulletinBoardNotifications, bulletin.id, setCollapsed]);

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

  const isNew = bulletinBoardNotifications.some((b) => b.id === bulletin.id);
  const markAsRead = () => {
    if (isNew) markBulletinAsRead(bulletin.id);
  };

  return (
    <div
      id={bulletin.id}
      role="button"
      tabIndex={0}
      className={cn(
        'relative mx-1 flex items-start justify-between break-all rounded-lg bg-muted-background p-4 pb-2',
        {
          ring: isNew,
          'cursor-pointer': isNew,
        },
      )}
      onClick={markAsRead}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === '') markAsRead();
      }}
    >
      <div className="flex-1">
        <h4 className="mb-2 w-[calc(100%-20px)] break-normal">
          <button
            type="button"
            className="flex items-start space-x-2 text-left hover:opacity-75"
            onClick={() => toggleCollapsed(bulletin.id)}
          >
            <ChevronRightIcon
              className={cn('mt-1 h-3 w-3 flex-shrink-0 transition-transform duration-200', {
                'rotate-90': !isCollapsed,
              })}
            />
            <span className="break-words text-lg font-bold leading-tight text-background">{bulletin.title}</span>
          </button>
        </h4>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="quill-content overflow-hidden break-normal text-background"
            >
              <BulletinContent
                html={bulletin.content}
                handleImageClick={handleImageClick}
              />
              {getAuthorDescription()}
            </motion.div>
          )}
        </AnimatePresence>
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
