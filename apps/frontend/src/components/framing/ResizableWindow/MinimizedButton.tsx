import React from 'react';

const MinimizeButton = ({ minimizeWindow }: { minimizeWindow: () => void }) => (
  <button
    type="button"
    onClick={minimizeWindow}
    className="flex h-10 w-16 items-center justify-center p-5 text-sm hover:bg-gray-600"
  >
    <div className="mt-[-8px]">__</div>
  </button>
);

export default MinimizeButton;
