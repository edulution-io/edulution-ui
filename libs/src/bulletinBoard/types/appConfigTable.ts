interface AppConfigTable<T> {
  tableContentData: T[];
  fetchTableContent: () => Promise<T[]>;
}

export default AppConfigTable;
