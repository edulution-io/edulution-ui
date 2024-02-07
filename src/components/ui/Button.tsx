import { Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';

interface CustomButtonProps extends ButtonProps {
  // Add any additional props or customizations here
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...rest }) => {
  return <Button {...rest}>{children}</Button>;
};

export default CustomButton;
