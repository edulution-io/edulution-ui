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

import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Label from '@/components/ui/Label';
import useWireguardStore from '@/store/useWireguardStore';
import { RadioGroupSH, RadioGroupItemSH } from '@/components/ui/RadioGroupSH';

interface AddPeerDialogProps {
  isOpen: boolean;
  handleOpenChange: () => void;
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

const AddPeerDialog: FC<AddPeerDialogProps> = ({ isOpen, handleOpenChange }) => {
  const { t } = useTranslation();
  const { createPeer, createSite } = useWireguardStore();
  const [isLoading, setIsLoading] = useState(false);

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
    if (isOpen) {
      form.reset({
        name: '',
        type: 'client',
        routes: '0.0.0.0/0',
        allowed_ips: '',
        endpoint: '',
      });
    }
  }, [isOpen, form]);

  const handleClose = () => {
    handleOpenChange();
    form.reset();
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const routes = data.routes ? data.routes.split(',').map((r) => r.trim()) : ['0.0.0.0/0'];

      if (data.type === 'site') {
        const allowedIps = data.allowed_ips ? data.allowed_ips.split(',').map((ip) => ip.trim()) : [];
        await createSite({
          name: data.name,
          allowed_ips: allowedIps,
          routes,
          endpoint: data.endpoint || undefined,
        });
        toast.success(t('wireguard.siteCreated'));
      } else {
        await createPeer({
          name: data.name,
          routes,
        });
        toast.success(t('wireguard.peerCreated'));
      }

      handleClose();
    } catch (error) {
      toast.error(t('wireguard.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t('wireguard.addPeer')}
      desktopContentClassName="max-w-2xl"
      body={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
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

            <FormField
              form={form}
              name="name"
              labelTranslationId="wireguard.name"
              placeholder={t('wireguard.namePlaceholder')}
            />

            <FormField
              form={form}
              name="routes"
              labelTranslationId="wireguard.routes"
              placeholder="0.0.0.0/0, 10.0.0.0/8"
              description={t('wireguard.routesDescription')}
            />

            {peerType === 'site' && (
              <>
                <FormField
                  form={form}
                  name="allowed_ips"
                  labelTranslationId="wireguard.allowedIps"
                  placeholder="192.168.1.0/24, 192.168.2.0/24"
                  description={t('wireguard.allowedIpsDescription')}
                />

                <FormField
                  form={form}
                  name="endpoint"
                  labelTranslationId="wireguard.endpoint"
                  placeholder="vpn.example.com:51820"
                  description={t('wireguard.endpointDescription')}
                />
              </>
            )}

            <DialogFooterButtons
              cancelButtonText={t('common.cancel')}
              submitButtonText={t('common.create')}
              handleClose={handleClose}
              submitButtonType="submit"
              disableSubmit={isLoading}
            />
          </form>
        </Form>
      }
    />
  );
};

export default AddPeerDialog;
