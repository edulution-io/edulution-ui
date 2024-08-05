import useIsMobileView from '@/hooks/useIsMobileView';
import React from 'react';

const Footer = () => {
  const isMobileView = useIsMobileView();

  return (
    <footer className="fixed bottom-0 flex w-full justify-center pt-1">
      <div className="container mx-auto bg-black text-center">
        <p className="overflow-hidden whitespace-nowrap text-ciLightGrey">
          &copy; {new Date().getFullYear()} {window.document.title}. {!isMobileView && 'All rights reserved.'} V
          {APP_VERSION}
        </p>
      </div>
    </footer>
  );
};
export default Footer;
