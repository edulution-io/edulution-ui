import React from 'react';
import { Button } from '@/components/shared/Button';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddStudentsDialogBody from '@/pages/SchoolmanagementPage/components/dialogs/AddStudentsDialogBody.tsx';

interface AddStudentsDialogProps {
  trigger?: React.ReactNode;
  isOpen: boolean;
  schoolClass: string;
  handleOpenChange: (isOpen: boolean) => void;
}

const AddStudentsDialog = ({ trigger, isOpen, handleOpenChange, schoolClass }: AddStudentsDialogProps) => {
  const { t } = useTranslation();

  const formSchema = z.object({
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async () => {
    form.reset();
    handleOpenChange(false);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);
  const getDialogBody = () => (
    <>
      <AddStudentsDialogBody form={form} />
    </>
  );

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          size="lg"
          type="submit"
        >
          {t('common.save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialogSH
      isOpen={isOpen}
      trigger={trigger}
      onClose={() => handleOpenChange(false)}
      title={`${t('schoolManagement.addUser')}: ${schoolClass}`}
      body={getDialogBody()}
      footer={getFooter()}
      handleOpenChange={() => handleOpenChange}
    />
  );
};

export default AddStudentsDialog;
