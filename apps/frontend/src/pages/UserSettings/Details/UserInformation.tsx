import React, { HTMLInputTypeAttribute } from 'react';
import Input from '@/components/shared/Input';

interface UserInformationProps {
  userInfoFields: { label: string; value: string | string[] | undefined; type?: HTMLInputTypeAttribute }[];
}

const UserInformation = ({ userInfoFields }: UserInformationProps) =>
  userInfoFields.map((field) => (
    <div
      key={`userInfoField-${field.label}`}
      className="items-center space-y-1"
    >
      <p className="font-bold">{field.label}:</p>
      <Input
        value={field.value}
        type={field.type || 'text'}
        variant="lightGrayDisabled"
        disabled
        readOnly
      />
    </div>
  ));

export default UserInformation;
