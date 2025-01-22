import React from 'react';
import { AvailableFileTypesType } from '@libs/filesharing/types/availableFileTypesType';

export interface DropdownOption {
  name: string;
  type: AvailableFileTypesType;
  title: string;
  icon: React.ElementType;
  iconColor?: string;
}
