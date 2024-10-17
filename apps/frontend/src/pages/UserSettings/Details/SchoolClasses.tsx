import React from 'react';
import cn from '@/lib/utils';
import BadgeField from '@/components/shared/BadgeField';
import { BadgeSH } from '@/components/ui/BadgeSH';

interface SchoolClassesProps {
  schoolClasses?: string[];
  className?: string;
}

const SchoolClasses = (props: SchoolClassesProps) => {
  const { schoolClasses = [], className } = props;

  if (schoolClasses.length === 0) {
    return <BadgeSH className={cn('bg-ciDarkGreyDisabled px-4', className)}>- No school classes -</BadgeSH>;
  }

  return (
    <BadgeField
      value={schoolClasses}
      onChange={() => {}}
      readOnly
      className={className}
    />
  );
};

export default SchoolClasses;
