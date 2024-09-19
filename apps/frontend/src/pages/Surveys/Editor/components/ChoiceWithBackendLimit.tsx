import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';
import { Input as SHInput } from '@/components/ui/Input';

interface ChoiceWithBackendLimitProps {
  // name: string;
  // setName: (name: string) => void;
  title: string;
  setTitle: (title: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  className?: string;
}

const ChoiceWithBackendLimit = (props: ChoiceWithBackendLimitProps) => {
  const {
    // name,
    // setName,
    title,
    setTitle,
    limit,
    setLimit,
    className,
  } = props;

  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-row items-center text-foreground', className)}>
      {/* <Input */}
      {/*  type="text" */}
      {/*  placeholder={t('common.name')} */}
      {/*  value={name} */}
      {/*  onChange={(e) => setName(e.target.value)} */}
      {/*  variant="default" */}
      {/*  className="text-foreground" */}
      {/* /> */}
      <Input
        type="text"
        placeholder={t('common.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="default"
        className="text-foreground"
      />
      <SHInput
        type="number"
        placeholder={t('common.limit')}
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="text-foreground"
      />
    </div>
  );
};

export default ChoiceWithBackendLimit;
