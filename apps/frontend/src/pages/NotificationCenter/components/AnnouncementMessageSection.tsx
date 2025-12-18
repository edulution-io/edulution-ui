import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Textarea } from '@/components/ui/Textarea';
import Input from '@/components/shared/Input';
import AnnouncementForm from '@libs/notification-center/types/announcementForm';
import {
  ANNOUNCEMENT_PUSH_MESSAGE_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
} from '@libs/notification-center/constants/formLimits';

interface AnnouncementSectionProps {
  form: UseFormReturn<AnnouncementForm>;
}

const AnnouncementMessageSection: React.FC<AnnouncementSectionProps> = ({ form }) => {
  const { t } = useTranslation();
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="font-bold">{t('notificationcenter.message')}</div>

      <FormFieldSH
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between">
              <p className="font-bold">{t('notificationcenter.title')}</p>
              <span className="text-sm text-muted-foreground">
                {field.value?.length || 0}/{ANNOUNCEMENT_TITLE_MAX_LENGTH}
              </span>
            </div>
            <FormControl>
              <Input
                placeholder={t('notificationcenter.titlePlaceholder')}
                maxLength={ANNOUNCEMENT_TITLE_MAX_LENGTH}
                {...field}
                variant="dialog"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormFieldSH
        control={control}
        name="pushMessage"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between">
              <p className="font-bold">{t('notificationcenter.pushMessage')}</p>
              <span className="text-sm text-muted-foreground">
                {field.value?.length || 0}/{ANNOUNCEMENT_PUSH_MESSAGE_MAX_LENGTH}
              </span>
            </div>
            <FormControl>
              <Textarea
                placeholder={t('notificationcenter.pushMessagePlaceholder')}
                rows={3}
                maxLength={ANNOUNCEMENT_PUSH_MESSAGE_MAX_LENGTH}
                {...field}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">{t('notificationcenter.pushMessageHint')}</p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AnnouncementMessageSection;
