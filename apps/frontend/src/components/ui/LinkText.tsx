import React from 'react';

type LinkTextProps = {
  to: string;
  title: string;
  children?: React.ReactNode;
};

const LinkText: React.FC<LinkTextProps> = ({ to, title, children }) => (
  <a
    href={to || '#'}
    target="_blank"
    title={title || ''}
    rel="noopener noreferrer"
    className="hover:text-ciDarkBlue"
  >
    {children}
  </a>
);

export default LinkText;
