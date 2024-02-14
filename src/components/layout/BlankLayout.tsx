import React, { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";

export const BlankLayout: React.FC<PropsWithChildren> = () => {
  return (
    <div>
      <main>{<Outlet />}</main>
    </div>
  );
};
