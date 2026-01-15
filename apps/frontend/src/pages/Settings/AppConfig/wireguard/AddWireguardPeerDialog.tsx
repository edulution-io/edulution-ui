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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RowSelectionState } from '@tanstack/react-table';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Label from '@/components/ui/Label';
import { RadioGroupSH, RadioGroupItemSH } from '@/components/ui/RadioGroupSH';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/useUserStore';
import useGroupStore from '@/store/GroupStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { BadgeSH } from '@/components/ui/BadgeSH';
import useWireguardConfigTableStore from './useWireguardConfigTableStore';

interface AddWireguardPeerDialogProps {
  tableId: ExtendedOptionKeysType;
}

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      type: z.enum(['client', 'site']),
      routes: z.string().optional(),
      allowed_ips: z.string().optional(),
      endpoint: z.string().optional(),
      name: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.type === 'site' && !data.allowed_ips) {
          return false;
        }
        return true;
      },
      {
        message: t('wireguard.validation.allowedIpsRequired'),
        path: ['allowed_ips'],
      },
    )
    .refine(
      (data) => {
        if (data.type === 'site' && !data.name) {
          return false;
        }
        return true;
      },
      {
        message: t('wireguard.validation.nameRequired'),
        path: ['name'],
      },
    );

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

const AddWireguardPeerDialog: React.FC<AddWireguardPeerDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<AttendeeDto[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<MultipleSelectorGroup[]>([]);

  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const {
    selectedRows,
    tableContentData,
    setSelectedRows,
    createPeers,
    createSite,
    deleteTableEntry,
    itemToDelete,
    setItemToDelete,
    fetchTableContent,
    isLoading,
  } = useWireguardConfigTableStore();

  const isOpen = isDialogOpen === tableId;
  const keys = Object.keys(selectedRows as RowSelectionState);
  const isOneRowSelected = keys.length === 1;
  const selectedPeerStatus = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      type: 'client',
      routes: '0.0.0.0/0',
      allowed_ips: '',
      endpoint: '',
      name: '',
    },
  });

  const peerType = form.watch('type');

  useEffect(() => {
    if (isOpen && !selectedPeerStatus) {
      form.reset({
        type: 'client',
        routes: '0.0.0.0/0',
        allowed_ips: '',
        endpoint: '',
        name: '',
      });
      setSelectedUsers([]);
      setSelectedGroups([]);
    }
  }, [isOpen, selectedPeerStatus, form]);

  const closeDialog = () => {
    setDialogOpen('');
    if (setSelectedRows) {
      setSelectedRows({});
    }
    form.reset();
    setSelectedUsers([]);
    setSelectedGroups([]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const data = form.getValues();
    const routes = data.routes ? data.routes.split(',').map((r) => r.trim()) : ['0.0.0.0/0'];

    if (data.type === 'site') {
      const allowedIps = data.allowed_ips ? data.allowed_ips.split(',').map((ip) => ip.trim()) : [];
      void createSite({
        name: data.name || '',
        allowed_ips: allowedIps,
        routes,
        endpoint: data.endpoint || undefined,
      });
    } else {
      const attendees = selectedUsers.map((user) => ({ username: user.username }));
      const groups = selectedGroups.map((group) => ({ path: group.path }));

      if (attendees.length > 0 || groups.length > 0) {
        void createPeers({ attendees, groups, routes });
      }
    }

    closeDialog();
  };

  const handleConfirmDelete = async () => {
    const peerToDelete = itemToDelete || selectedPeerStatus;
    if (peerToDelete?.peer && deleteTableEntry) {
      await deleteTableEntry('', peerToDelete.peer);
      if (setSelectedRows) {
        setSelectedRows({});
      }
      await fetchTableContent();
    }
    setItemToDelete(null);
    setIsDeleteDialogOpen(false);
    setDialogOpen('');
  };

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUsersChange = (users: AttendeeDto[]) => {
    setSelectedUsers(users);
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setSelectedGroups(groups);
  };

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => searchAttendees(value);

  const deleteItem = itemToDelete || selectedPeerStatus;

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (peerType === 'client' && selectedUsers.length === 0 && selectedGroups.length === 0) {
      return true;
    }
    return false;
  };

  const getFooter = () => {
    if (selectedPeerStatus) {
      return (
        <DialogFooterButtons
          handleClose={closeDialog}
          handleDelete={() => setIsDeleteDialogOpen(true)}
        />
      );
    }

    return (
      <form onSubmit={handleFormSubmit}>
        <DialogFooterButtons
          handleClose={closeDialog}
          handleSubmit={() => {}}
          disableSubmit={isSubmitDisabled()}
          submitButtonText="common.create"
          submitButtonType="submit"
        />
      </form>
    );
  };

  const getDialogBody = () => (
    <Form {...form}>
      <div className="space-y-4">
        {!selectedPeerStatus && (
          <FormFieldSH
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroupSH
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItemSH
                        value="client"
                        id="client"
                      />
                      <Label htmlFor="client">{t('wireguard.clientPeer')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItemSH
                        value="site"
                        id="site"
                      />
                      <Label htmlFor="site">{t('wireguard.siteToSite')}</Label>
                    </div>
                  </RadioGroupSH>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!selectedPeerStatus && peerType === 'client' && (
          <>
            <SearchUsersOrGroups
              users={selectedUsers}
              onSearch={onUsersSearch}
              onUserChange={handleUsersChange}
              groups={selectedGroups}
              onGroupSearch={searchGroups}
              onGroupsChange={handleGroupsChange}
              variant="dialog"
            />

            <FormField
              form={form}
              name="routes"
              labelTranslationId="wireguard.routes"
              placeholder="0.0.0.0/0, 10.0.0.0/8"
              description={t('wireguard.routesDescription')}
              variant="dialog"
            />
          </>
        )}

        {!selectedPeerStatus && peerType === 'site' && (
          <>
            <FormField
              form={form}
              name="name"
              labelTranslationId="wireguard.name"
              placeholder={t('wireguard.namePlaceholder')}
              variant="dialog"
            />

            <FormField
              form={form}
              name="routes"
              labelTranslationId="wireguard.routes"
              placeholder="0.0.0.0/0, 10.0.0.0/8"
              description={t('wireguard.routesDescription')}
              variant="dialog"
            />

            <FormField
              form={form}
              name="allowed_ips"
              labelTranslationId="wireguard.allowedIps"
              placeholder="192.168.1.0/24, 192.168.2.0/24"
              description={t('wireguard.allowedIpsDescription')}
              variant="dialog"
            />

            <FormField
              form={form}
              name="endpoint"
              labelTranslationId="wireguard.endpoint"
              placeholder="vpn.example.com:51820"
              description={t('wireguard.endpointDescription')}
              variant="dialog"
            />
          </>
        )}

        {selectedPeerStatus && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-bold">{t('wireguard.name')}: </span>
              {selectedPeerStatus.peer}
            </div>
            <div>
              <span className="font-bold">{t('wireguard.status')}: </span>
              <BadgeSH variant={selectedPeerStatus.status === 'connected' ? 'default' : 'secondary'}>
                {selectedPeerStatus.status === 'connected'
                  ? t('usersettings.wireguard.connected')
                  : t('usersettings.wireguard.disconnected')}
              </BadgeSH>
            </div>
            <div>
              <span className="font-bold">{t('wireguard.allowedIps')}: </span>
              {selectedPeerStatus.allowed_ips || '-'}
            </div>
            {selectedPeerStatus.endpoint && (
              <div>
                <span className="font-bold">{t('wireguard.endpoint')}: </span>
                {selectedPeerStatus.endpoint}
              </div>
            )}
            {selectedPeerStatus.last_handshake && (
              <div>
                <span className="font-bold">{t('wireguard.lastHandshake')}: </span>
                {selectedPeerStatus.last_handshake}
              </div>
            )}
          </div>
        )}
      </div>
    </Form>
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={closeDialog}
        title={selectedPeerStatus ? t('wireguard.peerDetails') : t('wireguard.addPeer')}
        body={getDialogBody()}
        footer={getFooter()}
        desktopContentClassName="max-w-2xl"
      />
      {deleteItem && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen || !!itemToDelete}
          onOpenChange={handleDeleteDialogClose}
          items={[{ id: deleteItem.peer, name: deleteItem.peer }]}
          onConfirmDelete={handleConfirmDelete}
          titleTranslationKey="wireguard.deletePeers"
          messageTranslationKey="wireguard.confirmDelete"
        />
      )}
    </>
  );
};

export default AddWireguardPeerDialog;
