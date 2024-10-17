import React from 'react';
import Field from '@/components/shared/Field';
import SingleInputProp from '@libs/common/types/single-input-prop';

interface UserInformationProps {
  userInfoFields: SingleInputProp[];
}

const UserInformation = (props: UserInformationProps) => {
  const { userInfoFields } = props;

  return userInfoFields.map((field) => (
    <Field
      key={`userInfoField-${field.name}`}
      value={field.value}
      type={field.type}
      labelTranslationId={field.label}
      readOnly={field.readOnly}
      variant="lightGrayDisabled"
    />
  ));
};

export default UserInformation;
