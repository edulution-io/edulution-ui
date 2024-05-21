import { FaWifi } from 'react-icons/fa';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FiPrinter } from 'react-icons/fi';
import React, { useState } from 'react';
import { RiShareForward2Line } from 'react-icons/ri';

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
          onClick={() => handleButtonClick('wifi')}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <AiOutlineGlobal
          className={selectedButtons.includes('global') ? 'text-green-500' : 'text-red-500'}
          onClick={() => handleButtonClick('global')}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <FiPrinter
          className={selectedButtons.includes('printer') ? 'text-green-500' : 'text-red-500'}
          onClick={() => handleButtonClick('printer')}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <RiShareForward2Line
          className="text-white"
          onClick={() => handleButtonClick('share')}
        />
      </div>
      <div className="flex cursor-pointer flex-col items-center">
        <RiShareForward2Line
          style={{ transform: 'scaleX(-1)' }}
          className="text-white"
          onClick={() => handleButtonClick('collect')}
        />
      </div>
    </div>
  );
};

export default StudentsPermissionBar;
