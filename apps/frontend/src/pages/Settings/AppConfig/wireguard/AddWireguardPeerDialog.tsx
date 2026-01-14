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
import useWireguardConfigTableStore from './useWireguardConfigTableStore';
import QRCodeDialog from './QRCodeDialog';

interface AddWireguardPeerDialogProps {
  tableId: ExtendedOptionKeysType;
}

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t('wireguard.validation.nameRequired')),
      type: z.enum(['client', 'site']),
      routes: z.string().optional(),
      allowed_ips: z.string().optional(),
      endpoint: z.string().optional(),
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
    );

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

const AddWireguardPeerDialog: React.FC<AddWireguardPeerDialogProps> = ({ tableId }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [qrCodePeerName, setQrCodePeerName] = useState<string | null>(null);

  const {
    selectedRows,
    tableContentData,
    setSelectedRows,
    createPeer,
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
  const selectedConfig = selectedRows && isOneRowSelected ? tableContentData[Number(keys[0])] : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      name: '',
      type: 'client',
      routes: '0.0.0.0/0',
      allowed_ips: '',
      endpoint: '',
    },
  });

  const peerType = form.watch('type');

  useEffect(() => {
    if (isOpen && selectedConfig) {
      const allowedIps =
        selectedConfig.type === 'site' && 'allowed_ips' in selectedConfig
          ? (selectedConfig.allowed_ips as string[])?.join(', ')
          : '';
      const endpoint =
        selectedConfig.type === 'site' && 'endpoint' in selectedConfig ? (selectedConfig.endpoint as string) : '';
      form.reset({
        name: selectedConfig.name,
        type: selectedConfig.type,
        routes: selectedConfig.routes?.join(', ') || '0.0.0.0/0',
        allowed_ips: allowedIps,
        endpoint,
      });
    } else if (isOpen) {
      form.reset({
        name: '',
        type: 'client',
        routes: '0.0.0.0/0',
        allowed_ips: '',
        endpoint: '',
      });
    }
  }, [isOpen, selectedConfig, form]);

  const closeDialog = () => {
    setDialogOpen('');
    if (setSelectedRows) {
      setSelectedRows({});
    }
    form.reset();
  };

  const onSubmit = async (data: FormValues) => {
    const routes = data.routes ? data.routes.split(',').map((r) => r.trim()) : ['0.0.0.0/0'];

    if (data.type === 'site') {
      const allowedIps = data.allowed_ips ? data.allowed_ips.split(',').map((ip) => ip.trim()) : [];
      await createSite({
        name: data.name,
        allowed_ips: allowedIps,
        routes,
        endpoint: data.endpoint || undefined,
      });
    } else {
      await createPeer({
        name: data.name,
        routes,
      });
    }

    closeDialog();
  };

  const handleConfirmDelete = async () => {
    const configToDelete = itemToDelete || selectedConfig;
    if (configToDelete?.name && deleteTableEntry) {
      await deleteTableEntry('', configToDelete.name);
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

  const handleShowQRCode = () => {
    if (selectedConfig && selectedConfig.type === 'client') {
      setQrCodePeerName(selectedConfig.name);
    }
  };

  const deleteItem = itemToDelete || selectedConfig;

  const getFooter = () => {
    if (selectedConfig) {
      return (
        <DialogFooterButtons
          handleClose={closeDialog}
          handleSubmit={selectedConfig.type === 'client' ? handleShowQRCode : undefined}
          handleDelete={() => setIsDeleteDialogOpen(true)}
          submitButtonText={selectedConfig.type === 'client' ? 'wireguard.showQRCode' : undefined}
        />
      );
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogFooterButtons
          handleClose={closeDialog}
          handleSubmit={() => {}}
          disableSubmit={isLoading}
          submitButtonText="common.create"
          submitButtonType="submit"
        />
      </form>
    );
  };

  const getDialogBody = () => (
    <Form {...form}>
      <form className="space-y-4">
        {!selectedConfig && (
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

        <FormField
          form={form}
          name="name"
          labelTranslationId="wireguard.name"
          placeholder={t('wireguard.namePlaceholder')}
          variant="dialog"
          disabled={!!selectedConfig}
        />

        {!selectedConfig && (
          <>
            <FormField
              form={form}
              name="routes"
              labelTranslationId="wireguard.routes"
              placeholder="0.0.0.0/0, 10.0.0.0/8"
              description={t('wireguard.routesDescription')}
              variant="dialog"
            />

            {peerType === 'site' && (
              <>
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
          </>
        )}

        {selectedConfig && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-bold">{t('wireguard.type')}: </span>
              {selectedConfig.type === 'site' ? t('wireguard.siteToSite') : t('wireguard.clientPeer')}
            </div>
            <div>
              <span className="font-bold">{t('wireguard.ip')}: </span>
              {selectedConfig.ip}
            </div>
            <div>
              <span className="font-bold">{t('wireguard.routes')}: </span>
              {selectedConfig.routes?.join(', ')}
            </div>
            {selectedConfig.type === 'site' &&
              'allowed_ips' in selectedConfig &&
              Array.isArray(selectedConfig.allowed_ips) && (
                <div>
                  <span className="font-bold">{t('wireguard.allowedIps')}: </span>
                  {selectedConfig.allowed_ips.join(', ')}
                </div>
              )}
          </div>
        )}
      </form>
    </Form>
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={closeDialog}
        title={selectedConfig ? t('wireguard.peerDetails') : t('wireguard.addPeer')}
        body={getDialogBody()}
        footer={getFooter()}
        desktopContentClassName="max-w-2xl"
      />
      {deleteItem && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen || !!itemToDelete}
          onOpenChange={handleDeleteDialogClose}
          items={[{ id: deleteItem.name, name: deleteItem.name }]}
          onConfirmDelete={handleConfirmDelete}
          titleTranslationKey="wireguard.deletePeers"
          messageTranslationKey="wireguard.confirmDelete"
        />
      )}
      <QRCodeDialog
        isOpen={qrCodePeerName !== null}
        handleOpenChange={() => setQrCodePeerName(null)}
        peerName={qrCodePeerName}
      />
    </>
  );
};

export default AddWireguardPeerDialog;
