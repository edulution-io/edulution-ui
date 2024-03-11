interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export default MenuItem;
