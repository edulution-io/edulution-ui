import React from 'react';

type FlagProps = {
  country: string;
  code: string;
};

const Flag: React.FC<FlagProps> = ({ country, code }) => (
  <div className="flex align-middle">
    <div className="h-[16px] w-[24px]" />
    <p>{`${country} (${code})`}</p>
  </div>
);

export default Flag;
