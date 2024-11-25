import React from 'react';

interface BulletinCategoryItemProps {
  text: string;
}

const BulletinCategoryItem: React.FC<BulletinCategoryItemProps> = ({ text }) => (
  <div className="bg- rounded-lg bg-white p-4 shadow-md">
    <p className="text-sm font-medium text-gray-800">{text}</p>
  </div>
);

export default BulletinCategoryItem;
