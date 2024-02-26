import React from "react";
import Home from "@/components/feature/Home";
import {MainLayout} from "@/components/layout/MainLayout.tsx";

export const HomePage: React.FC = () => {
  return (
      <MainLayout showLogo={true}>
         <Home />
      </MainLayout>
  );
};
