import React from 'react';

interface HexagonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}
const HexagonButton: React.FC<HexagonButtonProps> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="border-1 group relative flex h-8 w-8 items-center justify-center overflow-hidden border-green-600 border-opacity-0 bg-green-600 text-white transition-colors hover:border-opacity-100"
    style={{
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    }}
    type="button"
  >
    <span
      className="absolute inset-0 origin-center scale-x-0 transform bg-green-600 transition-transform group-hover:scale-x-100"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
    />
    <span className="relative z-10">{children}</span>
  </button>
);

export default HexagonButton;
