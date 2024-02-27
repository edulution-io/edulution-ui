import React from "react";
import { Header } from "@/components/ui/Header";
// import { Footer } from "@/components/ui/Footer";
import { Sidebar } from "../ui/Sidebar";
interface MainLayoutProps{
    children: React.ReactNode
    showLogo: boolean
}

export const MainLayout: React.FC<MainLayoutProps> = ({children,showLogo}) => {
  return (
    <>
      <Sidebar />
      <div className="bg-[#3B3B3B]">
        <div className="flex min-h-[100vh] flex-col">
            {showLogo ? (
                <div className="lg:px-20 px-5">
                  <Header />
                </div>
            ):(<></>)}

          <div className="flex-1">{children}</div>
          {/*<Footer />*/}
        </div>
      </div>
    </>
  );
};
