import { IconType } from 'react-icons';

interface FloatingButtonConfig {
  icon: IconType;
  text: string;
  onClick: () => void;
  isVisible?: boolean;
}

export default FloatingButtonConfig;
