import React from 'react';
import { useTranslation } from 'react-i18next';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { Button } from '@/components/shared/Button';
import { UseFormReturn } from 'react-hook-form';
import UserPasswordDialogForm from '@libs/classManagement/types/userPasswordDialogForm';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import generateRandomString from '@libs/common/utils/generateRandomString';
import FormField from '@/components/shared/FormField';
import useLmnApiStore from '@/store/useLmnApiStore';
import { toast } from 'sonner';

interface UserPasswordDialogBodyProps {
  user: UserLmnInfo;
  form: UseFormReturn<UserPasswordDialogForm>;
}

const UserPasswordDialogBody = ({ user: { cn: username }, form }: UserPasswordDialogBodyProps) => {
  const {
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = form;
  const { t } = useTranslation();

  const { fetchUser } = useLmnApiStore();
  const { setFirstPassword, setCurrentPassword } = UseLmnApiPasswordStore();

  const onSaveCurrentPasswordClick = async () => {
    await setCurrentPassword(username, getValues('currentPassword'));
  };

  const onSaveFirstPasswordClick = async () => {
    setValue('currentPassword', '');
    await setFirstPassword(username, getValues('firstPassword'));
  };

  const onGenerateFirstPasswordClick = async () => {
    setValue('currentPassword', '');
    const randomPassword = generateRandomString(8);
    setValue('firstPassword', randomPassword);
    await setFirstPassword(username, randomPassword);
  };

  const onRestoreFirstPasswordClick = async () => {
    setValue('currentPassword', '');
    const user = await fetchUser(username, true);
    if (user?.sophomorixFirstPassword) {
      await setCurrentPassword(username, user.sophomorixFirstPassword);
    } else {
      toast.success(t('classmanagement.firstPasswordNotSet'));
    }
  };

  return (
    <div className="flex flex-col text-base text-foreground">
      <table className="w-full table-fixed">
        <tbody>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('loginname')}</td>
            <td className="w-2/3 border p-2">{username}</td>
          </tr>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('classmanagement.firstPassword')}</td>
            <td className="w-2/3 border p-2">
              <div className="mb-2 flex flex-col items-stretch space-y-2 md:flex-row md:space-y-0">
                <div className="mt-0.5 flex-grow">
                  <FormField
                    name="firstPassword"
                    form={form}
                    variant="default"
                    defaultValue={form.getValues('firstPassword')}
                    type="password"
                    className="w-full flex-grow"
                  />
                </div>
                <Button
                  variant="btn-infrastructure"
                  className="self-end md:ml-2 md:mt-0 md:w-auto"
                  size="lg"
                  onClick={onSaveFirstPasswordClick}
                  disabled={!!errors.firstPassword || !watch('firstPassword').length}
                >
                  {t('common.save')}
                </Button>
              </div>
              <Button
                variant="btn-collaboration"
                className="mt-2 md:mt-0 md:w-auto"
                onClick={onGenerateFirstPasswordClick}
                size="lg"
              >
                {t('classmanagement.setRandom')}
              </Button>
            </td>
          </tr>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('classmanagement.currentPassword')}</td>
            <td className="w-2/3 border p-2">
              <div className="mb-2 flex flex-col items-stretch space-y-2 md:flex-row md:space-y-0">
                <div className="mt-0.5 flex-grow">
                  <FormField
                    name="currentPassword"
                    form={form}
                    defaultValue={form.getValues('currentPassword')}
                    variant="default"
                    type="password"
                    className="w-full flex-grow"
                  />
                </div>
                <Button
                  variant="btn-infrastructure"
                  className="self-end md:ml-2 md:mt-0 md:w-auto"
                  size="lg"
                  onClick={onSaveCurrentPasswordClick}
                  disabled={!!errors.currentPassword || !watch('currentPassword').length}
                >
                  {t('common.save')}
                </Button>
              </div>
              <Button
                variant="btn-collaboration"
                className="mt-2 whitespace-normal md:mt-0 md:w-auto"
                onClick={onRestoreFirstPasswordClick}
                size="lg"
              >
                {t('classmanagement.restoreFirstPassword')}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserPasswordDialogBody;
