import { ColumnDef } from '@tanstack/react-table';
import { StoreApi, UseBoundStore } from 'zustand';
import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import React from 'react';

export interface AppConfigTableEntry<T, TConfig> {
  key: string;
  columns: ColumnDef<TConfig>[];
  useStore: UseBoundStore<StoreApi<AppConfigTable<T>>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
}
