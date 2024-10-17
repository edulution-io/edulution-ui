import { HTMLInputTypeAttribute } from 'react';

interface MultiInputProp {
  name: string;
  label: string;
  value: string[];
  type?: HTMLInputTypeAttribute;
}

export default MultiInputProp;
