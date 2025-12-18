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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SectionAccordion } from '@/components/ui/SectionAccordion';
import { Form } from '@/components/ui/Form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useNotificationCenterStore from '@/pages/NotificationCenter/useNotificationCenterStore';
import AnnouncementMessageSection from '@/pages/NotificationCenter/components/AnnouncementMessageSection';
import AnnouncementRecipientsSection from '@/pages/NotificationCenter/components/AnnouncementRecipientsSection';
import AnnouncementChannelSection from '@/pages/NotificationCenter/components/AnnouncementChannelSection';
import AnnouncementForm from '@libs/notification-center/types/announcementForm';
import getAnnouncementFormSchema from '@libs/notification-center/constants/getAnnouncementFormSchema';
import { toast } from 'sonner';

interface CreateNewAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

const CreateNewAnnouncementDialog: React.FC<CreateNewAnnouncementDialogProps> = ({ isOpen, onClose, trigger }) => {
  const { t } = useTranslation();
  const { isLoading, createAnnouncement, selectedAnnouncement } = useNotificationCenterStore();

  const announcementFormDefaultValues: AnnouncementForm = {
    title: '',
    pushMessage: '',
    extendedMessage: '',
    recipientGroups: [],
    recipientUsers: [],
    channels: [],
  };

  const form = useForm<AnnouncementForm>({
    mode: 'onChange',
    resolver: zodResolver(getAnnouncementFormSchema(t)),
    defaultValues: announcementFormDefaultValues,
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async () => {
    const data = form.getValues();
    const success = await createAnnouncement({
      title: data.title,
      pushMessage: data.pushMessage,
      recipientGroups: data.recipientGroups,
      recipientUsers: data.recipientUsers,
      channels: data.channels,
    });
    if (success) {
      form.reset();
      onClose();
      toast.success(t('notificationcenter.announcementCreated'));
    }
  };

  useEffect(() => {
    if (selectedAnnouncement) {
      form.reset({
        title: selectedAnnouncement.title,
        pushMessage: selectedAnnouncement.pushMessage,
        extendedMessage: selectedAnnouncement.extendedMessage || '',
        channels: selectedAnnouncement.channels,
        recipientGroups: selectedAnnouncement.recipientGroups,
        recipientUsers: selectedAnnouncement.recipientUsers,
      });
    }
  }, [selectedAnnouncement, form]);

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => (
    <Form {...form}>
      <SectionAccordion defaultOpen={['message', 'recipients', 'delivery']}>
        <AnnouncementMessageSection form={form} />
        <AnnouncementRecipientsSection form={form} />
        <AnnouncementChannelSection form={form} />
      </SectionAccordion>
    </Form>
  );

  const hasRecipients = form.watch('recipientGroups').length > 0 || form.watch('recipientUsers').length > 0;

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={() => {}}
        submitButtonText="notificationcenter.send"
        submitButtonType="submit"
        disableSubmit={isLoading || !form.formState.isValid || !hasRecipients}
      />
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('notificationcenter.newAnnouncement')}
      desktopContentClassName="max-w-3xl"
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateNewAnnouncementDialog;
