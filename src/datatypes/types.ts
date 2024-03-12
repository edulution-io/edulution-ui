export type ConfigType = {
  [key: string]: { linkPath: string; icon: string; appType: string };
};

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}
