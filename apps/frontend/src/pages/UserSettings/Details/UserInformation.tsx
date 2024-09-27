import React, { HTMLInputTypeAttribute } from 'react';
import cn from '@/lib/utils';
import useIsMobileView from '@/hooks/useIsMobileView';
import Input from '@/components/shared/Input';

interface UserInformationProps {
  userInfoFields: { label: string; value: string | string[] | undefined; type?: HTMLInputTypeAttribute }[];
}

const UserInformation = ({ userInfoFields }: UserInformationProps) => {
  const isMobileView = useIsMobileView();

  return userInfoFields.map((field) => (
    <div
      key={`userInfoField-${field.label}`}
      // className="flex flex-row"
      className={cn({ 'flex flex-row gap-2 space-y-0': !isMobileView }, { 'space-y-1': isMobileView }, 'items-center')}
    >
      <p className="flex-0 w-[200px] font-bold">{field.label}:</p>
      <div className="flex-1 flex-wrap gap-2">
        <Input
          value={field.value}
          type={field.type || 'text'}
          variant="lightGrayDisabled"
          disabled
          readOnly
        />
      </div>
    </div>
  ));
};

export default UserInformation;
