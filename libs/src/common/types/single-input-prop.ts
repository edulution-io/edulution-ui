import { HTMLInputTypeAttribute } from 'react';

interface SingleInputProp {
  name: string;
  label: string;
  value: string | number;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
}

export default SingleInputProp;
