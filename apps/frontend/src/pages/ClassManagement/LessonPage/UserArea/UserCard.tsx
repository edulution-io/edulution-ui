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

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shared/Card';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import cn from '@libs/common/utils/className';
import UserCardButtonBar from '@/pages/ClassManagement/LessonPage/UserArea/UserCardButtonBar';
import Checkbox from '@/components/ui/Checkbox';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';
import { useTranslation } from 'react-i18next';
import UserPasswordDialog from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialog';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import useVeyonApiStore from '../../useVeyonApiStore';
import UserCardVeyonPreview from './UserCardVeyonPreview';

interface UserCardProps {
  user: LmnUserInfo;
  selectedMember: LmnUserInfo[];
  setSelectedMember: React.Dispatch<React.SetStateAction<LmnUserInfo[]>>;
  isTeacherInSameClass: boolean;
  isVeyonEnabled: boolean;
}

const UserCard = ({ user, selectedMember, isTeacherInSameClass, setSelectedMember, isVeyonEnabled }: UserCardProps) => {
  const { t } = useTranslation();
  const { currentUser } = useLmnApiPasswordStore();
  const { userConnectionsFeatureStates, userConnectionUids, authenticateVeyonClient, getFeatures } = useVeyonApiStore();
  const { displayName, name, sophomorixAdminClass, school, examMode } = user;

  const studentName = examMode ? `${name}-exam` : name;

  const isSelectable = user.sophomorixRole === SOPHOMORIX_STUDENT && isTeacherInSameClass;
  const isMemberSelected = !!selectedMember.find((m) => m.dn === user.dn) && isSelectable;
  const schoolClassName = removeSchoolPrefix(sophomorixAdminClass, school);
  const connectionUid = userConnectionUids.find((conn) => conn.veyonUsername === user.cn)?.connectionUid || '';
  const userConnectionFeatureState = userConnectionsFeatureStates[connectionUid];

  useEffect(() => {
    const connIp = getStringFromArray(user.sophomorixIntrinsic3);
    if (isVeyonEnabled && connIp && isSelectable) {
      void authenticateVeyonClient(connIp, user.cn);
    }
  }, [user]);

  useEffect(() => {
    if (isVeyonEnabled && connectionUid) {
      void getFeatures(connectionUid);
    }
  }, [isVeyonEnabled, connectionUid]);

  const getFeatureState = (featureUid: string) => {
    const feature = userConnectionFeatureState?.find((item) => item.uid === featureUid);
    return feature ? feature.active : undefined;
  };

  const isScreenLocked = !!getFeatureState(VEYON_FEATURE_ACTIONS.SCREENLOCK);
  const areInputDevicesLocked = !!getFeatureState(VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK);

  const onCardClick = () => {
    if (!isSelectable) {
      if (user.sophomorixRole === SOPHOMORIX_STUDENT)
        toast.info(t('classmanagement.itsNotPossibleToEditExternalStudents'));
      return;
    }

    setSelectedMember(() => {
      if (isMemberSelected) {
        return selectedMember.filter((m) => m.dn !== user.dn);
      }
      return [...selectedMember, user];
    });
  };

  return (
    <Card
      variant="text"
      className={cn(isSelectable ? 'cursor-pointer' : 'cursor-not-allowed', 'my-2 ml-1 mr-4 flex h-64 min-w-80')}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onCardClick();
        }
      }}
      tabIndex={0}
    >
      <CardContent className="flex w-full flex-row p-0">
        <div
          className={cn(
            'm-0 flex w-5/6 flex-col justify-between opacity-85 hover:opacity-100',
            isMemberSelected && 'opacity-100',
          )}
        >
          <div className="flew-row flex h-8">
            {isSelectable && (
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isMemberSelected}
                onCheckedChange={onCardClick}
                aria-label={t('select')}
              />
            )}
            <div className={cn('text-md mt-1 h-8 w-44 font-bold', !isSelectable && 'ml-2')}>
              {displayName}
              <span className="flex text-xs">{studentName}</span>
            </div>
          </div>

          <div className="-my-1 ml-2 flex justify-between">
            <span className="mt-1 h-6 rounded-lg bg-accent-light px-2 py-0 text-sm">{schoolClassName}</span>
            <TooltipProvider>
              <ActionTooltip
                className="bg-accent-light p-1 text-sm"
                tooltipText={t('classmanagement.quota')}
                openOnSide="left"
                trigger={
                  <div className="flex flex-col">
                    <span className="mt-1 h-6 rounded-lg bg-accent-light px-2 py-0 text-sm">
                      {user.sophomorixCloudQuotaCalculated?.[0]}
                    </span>
                  </div>
                }
              />
            </TooltipProvider>
          </div>
          <div className="m-2 flex max-h-36 w-64 flex-grow items-center justify-center rounded-xl bg-accent-light text-2xl">
            <UserCardVeyonPreview
              user={user}
              isVeyonEnabled={isVeyonEnabled}
              areInputDevicesLocked={areInputDevicesLocked}
              connectionUid={connectionUid}
            />
          </div>
        </div>
        <div
          className={cn(
            !isSelectable && 'cursor-not-allowed',
            'ml-2 flex w-1/6 flex-col items-center justify-around rounded-r-xl border-l-[1px] border-accent bg-foreground scrollbar-thin',
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCardClick();
            }
          }}
          tabIndex={-1}
          role="button"
        >
          <UserCardButtonBar
            user={user}
            isTeacherInSameClass={isTeacherInSameClass}
            isScreenLocked={isScreenLocked}
            areInputDevicesLocked={areInputDevicesLocked}
            disabled={!isSelectable}
          />
        </div>
      </CardContent>
      {currentUser?.dn === user.dn && <UserPasswordDialog />}
    </Card>
  );
};

export default UserCard;
