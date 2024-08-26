import React from 'react';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import { useTranslation } from 'react-i18next';
import UserPasswordDialogForm from '@libs/classManagement/types/userPasswordDialogForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CircleLoader from '@/components/ui/CircleLoader';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UserPasswordDialogBody from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialogBody';

interface UserPasswordDialogProps {
  trigger?: React.ReactNode;
}

const UserPasswordDialog = ({ trigger }: UserPasswordDialogProps) => {
  const { t } = useTranslation();

  const { isLoading, setCurrentUser, currentUser } = UseLmnApiPasswordStore();

  if (!currentUser) return null;

  const { sophomorixFirstPassword, displayName } = currentUser;

  const initialFormValues: UserPasswordDialogForm = {
    currentPassword: '',
    firstPassword: sophomorixFirstPassword,
  };

  const passwordValidationSchema = z
    .string()
    .min(7, { message: t('common.min_chars', { count: 7 }) })
    .max(60, { message: t('common.max_chars', { count: 60 }) })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d\W]).*$/, { message: t('classmanagement.passwordRequirements') });

  const formSchema = z.object({
    firstPassword: passwordValidationSchema,
    currentPassword: passwordValidationSchema,
  });

  const form = useForm<UserPasswordDialogForm>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onClose = () => {
    setCurrentUser(null);
    form.reset();
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto" />;
    return (
      <UserPasswordDialogBody
        user={currentUser}
        form={form}
      />
    );
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div onClick={(e) => e.stopPropagation()}>
      <AdaptiveDialog
        isOpen={!!currentUser}
        trigger={trigger}
        handleOpenChange={onClose}
        title={t('classmanagement.userPasswordDialogTitle', { displayName })}
        desktopContentClassName="max-w-4xl"
        body={getDialogBody()}
        footer={null}
      />
    </div>
  );
};

export default UserPasswordDialog;
