import { ColumnDef } from '@tanstack/react-table';
import { StoreApi, UseBoundStore } from 'zustand';
import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import React from 'react';

export interface AppConfigTableEntry<U, T extends AppConfigTable<U>> {
  key: string;
  columns: ColumnDef<T>[];
  useStore: UseBoundStore<StoreApi<U>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
}
