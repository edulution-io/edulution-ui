interface AppConfigTable<T> {
  tableData: T[];
  fetchGenericTableContent: () => Promise<T[]>;
}

export default AppConfigTable;
