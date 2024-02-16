import React, { PropsWithChildren } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Sidebar } from "../ui/Sidebar";

export const MainLayout: React.FC<PropsWithChildren> = ({children}) => {
  return (
    <>
      <Sidebar />
      <div className="bg-[#3B3B3B]">
        <div className="flex min-h-[100vh] flex-col px-5 lg:px-20">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </>
  );
};
