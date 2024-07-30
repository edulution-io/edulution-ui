import React from 'react';

const Footer = () => (
  <footer className="fixed bottom-0 flex w-full justify-center pt-1">
    <div className="container mx-auto bg-black text-center">
      <p className="text-ciLightGrey">
        &copy; {new Date().getFullYear()} edulution-io. All rights reserved. V{APP_VERSION}
      </p>
    </div>
  </footer>
);

export default Footer;
