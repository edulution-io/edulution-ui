import React from 'react';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';

export interface DropdownOption {
  name: string;
  type: TAvailableFileTypes;
  title: string;
  icon: React.ElementType;
  iconColor?: string;
}
