import React from 'react';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';

export interface DropdownOption {
  extension: string;
  name: string;
  type: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey];
  title: string;
  icon: React.ElementType;
  iconColor?: string;
}
