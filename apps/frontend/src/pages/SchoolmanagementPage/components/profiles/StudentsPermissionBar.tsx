import { FaWifi } from 'react-icons/fa';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FiPrinter } from 'react-icons/fi';
import React, { useState } from 'react';

const StudentsPermissionBar = () => {
  const [selectedButtons, setSelectedButtons] = useState<string[]>([]);

  const handleButtonClick = (button: string) => {
    setSelectedButtons((prevState) =>
      prevState.includes(button) ? prevState.filter((item) => item !== button) : [...prevState, button],
    );
  };

  return (
    <div className="mt-4 flex justify-around">
      <div className="flex cursor-pointer flex-col items-center">
        <FaWifi
          className={selectedButtons.includes('wifi') ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick('wifi');
          }}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <AiOutlineGlobal
          className={selectedButtons.includes('global') ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            e.preventDefault();
            handleButtonClick('global');
          }}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <FiPrinter
          className={selectedButtons.includes('printer') ? 'text-green-500' : 'text-red-500'}
          onClick={(e) => {
            handleButtonClick('printer');
            e.preventDefault();
          }}
        />
      </div>
    </div>
  );
};

export default StudentsPermissionBar;
