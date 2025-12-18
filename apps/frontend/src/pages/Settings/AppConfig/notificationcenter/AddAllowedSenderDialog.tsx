import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RowSelectionState } from '@tanstack/react-table';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useGroupStore from '@/store/GroupStore';
import useUserStore from '@/store/UserStore/useUserStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import Input from '@/components/shared/Input';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type AttendeeDto from '@libs/user/types/attendee.dto';
import type { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import getRandomUUID from '@/utils/getRandomUUID';
import useAllowedSenderTableStore from './useAllowedSenderTableStore';

interface AddAllowedSenderDialogProps {
  tableId: ExtendedOptionKeysType;
}

const AddAllowedSenderDialog: React.FC<AddAllowedSenderDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { searchAttendees } = useUserStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const { tableContentData, setTableContentData, selectedRows, setSelectedRows } = useAllowedSenderTableStore();

  const [name, setName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<MultipleSelectorGroup[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AttendeeDto[]>([]);

  const isOpen = isDialogOpen === tableId;
  const keys = Object.keys(selectedRows as RowSelectionState);
  const isOneRowSelected = keys.length === 1;

  const selectedConfig = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  useEffect(() => {
    if (selectedConfig) {
      setName(selectedConfig.name || '');
      setSelectedGroups(selectedConfig.allowedGroups || []);
      setSelectedUsers(selectedConfig.allowedUsers || []);
    } else {
      setName('');
      setSelectedGroups([]);
      setSelectedUsers([]);
    }
  }, [selectedConfig]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedRows({});
    setName('');
    setSelectedGroups([]);
    setSelectedUsers([]);
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    const uniqueGroups = groups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setSelectedGroups(uniqueGroups);
  };

  const handleUsersChange = (users: AttendeeDto[]) => {
    const uniqueUsers = users.reduce<AttendeeDto[]>((acc, u) => {
      if (!acc.some((x) => x.value === u.value)) acc.push(u);
      return acc;
    }, []);
    setSelectedUsers(uniqueUsers);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newEntry = {
      allowedSenderId: selectedConfig?.allowedSenderId || getRandomUUID(),
      name,
      allowedGroups: selectedGroups,
      allowedUsers: selectedUsers,
    };

    if (selectedConfig) {
      const updatedData = tableContentData.map((entry) =>
        entry.allowedSenderId === selectedConfig.allowedSenderId ? newEntry : entry,
      );
      await setTableContentData(updatedData);
    } else {
      await setTableContentData([...tableContentData, newEntry]);
    }

    closeDialog();
  };

  const isFormValid = name.trim().length > 0 && (selectedGroups.length > 0 || selectedUsers.length > 0);

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <DialogFooterButtons
        handleClose={closeDialog}
        handleSubmit={() => {}}
        disableSubmit={!isFormValid}
        submitButtonText="common.save"
        submitButtonType="submit"
      />
    </form>
  );

  const getDialogBody = () => (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-bold">{t('common.name')}</p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('notificationcenter.namePlaceholder')}
          variant="dialog"
        />
      </div>

      <div>
        <p className="mb-2 font-bold">{t('notificationcenter.allowedGroups')}</p>
        <AsyncMultiSelect<MultipleSelectorGroup>
          value={selectedGroups}
          onSearch={searchGroups}
          onChange={handleGroupsChange}
          placeholder={t('notificationcenter.searchGroups')}
          variant="dialog"
        />
      </div>

      <div>
        <p className="mb-2 font-bold">{t('notificationcenter.allowedUsers')}</p>
        <AsyncMultiSelect<AttendeeDto>
          value={selectedUsers}
          onSearch={searchAttendees}
          onChange={handleUsersChange}
          placeholder={t('notificationcenter.searchUsers')}
          variant="dialog"
        />
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={closeDialog}
      title={selectedConfig ? t('notificationcenter.editAllowedSender') : t('notificationcenter.addAllowedSender')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default AddAllowedSenderDialog;
