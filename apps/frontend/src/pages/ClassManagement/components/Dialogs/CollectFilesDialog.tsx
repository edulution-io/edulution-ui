import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import { Button } from '@/components/shared/Button';
import { FaCopy, FaCut } from 'react-icons/fa';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { LMN_API_COLLECT_OPERATIONS, LmnApiCollectOperations } from '@libs/lmnApi/types/lmnApiCollectOperations';
import { LAYOUT_OPTIONS } from '@libs/ui/constants/layout';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';

const CollectFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { collectionType, setCollectionType } = useLessonStore();

  const options: Record<
    LmnApiCollectOperations,
    {
      id: LmnApiCollectOperations;
      label: string;
      icon: JSX.Element;
    }
  > = {
    [LMN_API_COLLECT_OPERATIONS.CUT]: {
      id: LMN_API_COLLECT_OPERATIONS.CUT,
      label: t('classmanagement.collectAndCut'),
      icon: <FaCut />,
    },
    [LMN_API_COLLECT_OPERATIONS.COPY]: {
      id: LMN_API_COLLECT_OPERATIONS.COPY,
      label: t('classmanagement.collectAndCopy'),
      icon: <FaCopy />,
    },
  };

  const selectedOption = options[collectionType];

  const getDialogBody = () => (
    <>
      <div className="w-full items-center pb-6 ">{t('classmanagement.copyOrCut')}</div>
      <div className="flex flex-col items-center justify-start pb-8">
        <RadioGroupSH
          className="flex flex-col gap-4"
          value={selectedOption?.id}
          onValueChange={(value: LmnApiCollectOperations) => {
            if (options[value]) {
              setCollectionType(value);
            }
          }}
        >
          {Object.values(options).map((option) => (
            <div
              key={option.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <RadioGroupItemSH
                id={`option-${option.id}`}
                value={option.id}
                checked={selectedOption?.id === option.id}
              />
              <label htmlFor={`option-${option.id}`}>
                <div className="flex flex-row justify-center space-x-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </label>
            </div>
          ))}
        </RadioGroupSH>
      </div>
    </>
  );

  const getFooter = () => (
    <div className="absolute bottom-0 left-0 right-0 flex justify-end p-4">
      <Button
        type="button"
        size="lg"
        variant="btn-collaboration"
        onClick={action}
      >
        {t(`classmanagement.${title}`)}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
      layout={LAYOUT_OPTIONS.TWO_COLUMN}
    />
  );
};

export default CollectFilesDialog;
