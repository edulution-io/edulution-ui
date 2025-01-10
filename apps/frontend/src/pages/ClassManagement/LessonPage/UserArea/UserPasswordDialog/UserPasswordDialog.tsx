import React, { useEffect, useState } from 'react';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import { useTranslation } from 'react-i18next';
import UserPasswordDialogForm from '@libs/classManagement/types/userPasswordDialogForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CircleLoader from '@/components/ui/CircleLoader';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UserPasswordDialogBody from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialogBody';
import useLmnApiStore from '@/store/useLmnApiStore';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { Form } from '@/components/ui/Form';

interface UserPasswordDialogProps {
  trigger?: React.ReactNode;
}

const UserPasswordDialog = ({ trigger }: UserPasswordDialogProps) => {
  const { t } = useTranslation();

  const { isLoading, setCurrentUser, currentUser } = UseLmnApiPasswordStore();
  const { isFetchUserLoading, fetchUser } = useLmnApiStore();
  const [user, setUser] = useState<UserLmnInfo | null>(null);

  const initialFormValues: UserPasswordDialogForm = {
    currentPassword: '',
    firstPassword: '',
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

  useEffect(() => {
    const getUser = async () => {
      if (currentUser?.cn) {
        const result = await fetchUser(currentUser?.cn, true);
        setUser(result);
      }
    };

    void getUser();
  }, [currentUser]);

  useEffect(() => {
    if (user?.sophomorixFirstPassword) {
      form.setValue('firstPassword', user.sophomorixFirstPassword);
    } else {
      setUser(null);
    }
  }, [user]);

  const onClose = () => {
    setCurrentUser(null);
    form.reset();
  };

  const getDialogBody = () => {
    if (!user || isLoading || isFetchUserLoading) return <CircleLoader className="mx-auto" />;
    return (
      <Form
        {...form}
        data-testid="test-id-login-page-form"
      >
        <form
          className="space-y-4"
          data-testid="test-id-login-page-form"
        >
          <UserPasswordDialogBody
            user={user}
            form={form}
          />
        </form>
      </Form>
    );
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div onClick={(e) => e.stopPropagation()}>
      <AdaptiveDialog
        isOpen={!!user || isFetchUserLoading}
        trigger={trigger}
        handleOpenChange={onClose}
        title={t('classmanagement.userPasswordDialogTitle', { displayName: user?.displayName })}
        desktopContentClassName="max-w-4xl"
        body={getDialogBody()}
        footer={null}
      />
    </div>
  );
};

export default UserPasswordDialog;
