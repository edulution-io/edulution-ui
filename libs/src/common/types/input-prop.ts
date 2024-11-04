import { HTMLInputTypeAttribute } from 'react';

interface InputProp<T> {
  name: string;
  label: string;
  value: T;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
}

export default InputProp;
