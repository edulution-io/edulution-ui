import React from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { ColumnDef } from '@tanstack/react-table';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import { BulletinBoardTableStore } from '@/pages/BulletinBoard/useBulletinBoardStore';

export interface AppConfigTableEntry<T, TConfig> {
  key: string;
  columns: ColumnDef<TConfig>[];
  useStore: UseBoundStore<StoreApi<AppConfigTable<T>>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
}

export type AppConfigTableEntryUnion = AppConfigTableEntry<BulletinBoardTableStore, BulletinCategoryResponseDto>;

type AppConfigTableConfigMap = {
  bulletinboard: AppConfigTableEntryUnion[];
};

export default AppConfigTableConfigMap;
