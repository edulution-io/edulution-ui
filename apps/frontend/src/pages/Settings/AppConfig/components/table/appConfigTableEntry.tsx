import { ColumnDef } from '@tanstack/react-table';
import { StoreApi, UseBoundStore } from 'zustand';
import React from 'react';

export interface AppConfigTableEntry<T, TConfig> {
  key: string;
  columns: ColumnDef<TConfig>[];
  useStore: UseBoundStore<StoreApi<T>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
}
