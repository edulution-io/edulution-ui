import { HTMLInputTypeAttribute } from 'react';

interface BooleanInputProp {
  name: string;
  label: string;
  value: string | number;
  type?: HTMLInputTypeAttribute;
}

export default BooleanInputProp;
