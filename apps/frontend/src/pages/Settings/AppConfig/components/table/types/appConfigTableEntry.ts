import { ColumnDef } from '@tanstack/react-table';
import { StoreApi, UseBoundStore } from 'zustand';
import React from 'react';
import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';

interface AppConfigTableEntry<DataType, StoreType extends AppConfigTable<DataType>> {
  key: string;
  columns: ColumnDef<DataType>[];
  useStore: UseBoundStore<StoreApi<StoreType>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
}

export default AppConfigTableEntry;
