import AppConfigBulletinTableColumn from '@/pages/Settings/AppConfig/components/table/AppConfigBulletinTableColum';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTable,
    },
    {
      columns: [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'description', header: 'Description' },
      ],
      useStore: () => ({
        getData: () => [{ id: 2, description: 'Second Bulletin' }],
        openCreateCategoryDialog: () => console.log('Open create category dialog'),
      }),
    },
  ],
};

export default TABLE_CONFIG_MAP;
