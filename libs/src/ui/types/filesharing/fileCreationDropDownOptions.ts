import React from 'react';
import AVAILABLE_FILE_TYPES from '@libs/ui/types/filesharing/AvailableFileTypes';
import { FileTypeKey } from '@libs/ui/types/filesharing/FileTypeKey';

export interface DropdownOption {
  extension: string;
  name: string;
  type: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey];
  title: string;
  icon: React.ElementType;
  iconColor?: string;
}
