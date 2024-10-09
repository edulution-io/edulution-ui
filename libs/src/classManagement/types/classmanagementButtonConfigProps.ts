type ClassmanagementButtonConfigProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  action?: () => Promise<void>;
  enableAction: () => Promise<void>;
  disableAction: () => Promise<void>;
  enableText?: string;
  disableText?: string;
};

export default ClassmanagementButtonConfigProps;
