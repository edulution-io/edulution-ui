import React, { PropsWithChildren } from 'react';
import HorizontalMenuBar_sh from "@/pages/MenuBar/HorizontalMenuBar_sh.tsx";

const MainLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="bg-default_background w-full h-full">
      <header><HorizontalMenuBar_sh></HorizontalMenuBar_sh></header>
      <main>{children}</main>
      <footer>{/* Add your footer content here */}</footer>
    </div>
  );
};

export default MainLayout;
