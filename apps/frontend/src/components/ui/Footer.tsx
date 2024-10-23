import useIsMobileView from '@/hooks/useIsMobileView';
import React from 'react';

const Footer = () => {
  const isMobileView = useIsMobileView();

  return (
    <footer className="fixed bottom-0 flex w-full justify-center pt-1">
      <div className="mx-auto w-96 rounded-t-lg bg-black text-center">
        <p className="overflow-hidden whitespace-nowrap text-ciGrey">
          &copy; {new Date().getFullYear()} {window.document.title}. {!isMobileView && 'All rights reserved.'} V
          {APP_VERSION}
        </p>
      </div>
    </footer>
  );
};
export default Footer;
