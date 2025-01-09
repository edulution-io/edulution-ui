import useIsMobileView from '@/hooks/useIsMobileView';
import React from 'react';
import { FOOTER_ID } from '@libs/common/constants/pageElementIds';

const Footer = () => {
  const isMobileView = useIsMobileView();

  return (
    <footer
      id={FOOTER_ID}
      className="fixed bottom-0 flex w-full justify-center pt-1"
    >
      <div className="black-centered-shadow mx-auto w-96 rounded-t-lg bg-black text-center">
        <p className="overflow-hidden whitespace-nowrap text-muted">
          &copy; {new Date().getFullYear()} {window.document.title}. {!isMobileView && 'All rights reserved.'} V
          {APP_VERSION}
        </p>
      </div>
    </footer>
  );
};
export default Footer;
