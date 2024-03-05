export const QUERY_KEY: Record<string, string> = {
  repoData: 'repoData',
};

type SettingsType = {
  id: number;
  label: string;
};

export const SETTINGS_FORWARDED_PAGES: SettingsType[] = [
  {
    id: 0,
    label: 'conference',
  },
  {
    id: 1,
    label: 'firewall',
  },
  {
    id: 2,
    label: 'virtualization',
  },
];
