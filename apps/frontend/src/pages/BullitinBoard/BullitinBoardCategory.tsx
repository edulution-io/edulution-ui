import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';
import React from 'react';
import BulletinCategoryItem from '@/pages/BullitinBoard/BulletinCategoryItem';

interface BullitinBoardCategoryProps {
  value: string;
  title: string;
  content: { id: string; text: string }[];
}

const BullitinBoardCategory: React.FC<BullitinBoardCategoryProps> = ({ value, title, content }) => (
  <AccordionItem
    value={value}
    className="rounded-lg bg-ciLightGrey p-4 shadow-lg"
  >
    <AccordionTrigger className="text-lg font-bold text-gray-700">{title}</AccordionTrigger>
    <AccordionContent className="mt-4 flex max-h-[65vh] flex-col gap-4 overflow-auto">
      {content.map((item) => (
        <BulletinCategoryItem
          text={item.text}
          key={item.id}
        />
      ))}
    </AccordionContent>
  </AccordionItem>
);

export default BullitinBoardCategory;
