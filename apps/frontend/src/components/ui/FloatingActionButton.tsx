import { Button } from '@/components/shared/Button';
import { IconContext, IconType } from 'react-icons';

interface FloatingActionButtonProps {
  icon: IconType;
  text: string;
  onClick?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ icon: Icon, text, onClick }) => {
  const iconContextValue = { className: 'h-8 w-8 m-5' };

  return (
    <div className="flex flex-col items-center justify-center space-x-2">
      <Button
        type="button"
        variant="btn-hexagon"
        className="bg-opacity-90 p-4"
        onClick={onClick}
      >
        <IconContext.Provider value={iconContextValue}>
          <Icon />
        </IconContext.Provider>
      </Button>
      <p className="justify-center text-center text-white">{text}</p>
    </div>
  );
};

export default FloatingActionButton;
