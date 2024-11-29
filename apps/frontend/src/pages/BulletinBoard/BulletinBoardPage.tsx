import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/shared/Card';
import cn from '@libs/common/utils/className';
import { Button } from '@/components/shared/Button';
import { BLANK_LAYOUT_HEADER_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';

const dummyData = [
  {
    id: 1,
    category: 'To Do',
    posts: [
      {
        id: 101,
        title: 'Plan new feature',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>',
      },
      {
        id: 102,
        title: 'Design wireframes',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p>',
      },
      {
        id: 103,
        title: 'Plan new feature',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>',
      },
      {
        id: 104,
        title: 'Design wireframes',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p>',
      },
      {
        id: 101,
        title: 'Plan new feature',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>',
      },
      {
        id: 102,
        title: 'Design wireframes',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p>',
      },
    ],
  },
  {
    id: 2,
    category: 'In Progress',
    posts: [
      {
        id: 201,
        title: 'Develop API',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p><p><img width="500" src="http://localhost:5173/src/assets/logos/edulution.io_USER%20INTERFACE.svg" /></p>',
      },
    ],
  },
  {
    id: 3,
    category: 'Done',
    posts: [
      {
        id: 301,
        title: 'Deploy to staging',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet..</p>',
      },
    ],
  },
  {
    id: 4,
    category: 'To Do',
    posts: [
      {
        id: 101,
        title: 'Plan new feature',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>',
      },
      {
        id: 102,
        title: 'Design wireframes',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p>',
      },
    ],
  },
  {
    id: 5,
    category: 'In Progress',
    posts: [
      {
        id: 201,
        title: 'Develop API',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p><p><img width="500" src="http://localhost:5173/src/assets/logos/edulution.io_USER%20INTERFACE.svg" /></p>',
      },
      {
        id: 101,
        title: 'Plan new feature',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>',
      },
      {
        id: 102,
        title: 'Design wireframes',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam.</p>',
      },
    ],
  },
  {
    id: 6,
    category: 'Done',
    posts: [
      {
        id: 301,
        title: 'Deploy to staging',
        content:
          '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet..</p>',
      },
    ],
  },
];

const BulletinBoardPage = () => {
  const { t } = useTranslation();

  const pageBarsHeight = useElementHeight([BLANK_LAYOUT_HEADER_ID, FOOTER_ID]);

  return (
    <div
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      className="flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin md:w-[calc(100%-var(--sidebar-width))] lg:w-full lg:overflow-x-auto"
    >
      {dummyData.map((category) => (
        <div
          key={category.id}
          className={cn('flex h-full w-1/2 flex-shrink-0 flex-col rounded-lg p-4', {
            'w-1/3': dummyData.length === 3,
            'w-[300px]': dummyData.length >= 4,
          })}
        >
          <Card
            variant="security"
            className="sticky mb-4 flex items-center justify-between rounded-lg px-3 py-1 opacity-90"
          >
            <h4 className="text-white">{category.category}</h4>
            <Button
              type="button"
              className="text-white-500 flex h-8 w-8 items-center justify-center rounded-full p-1 hover:bg-blue-600 hover:text-white"
              title={t('TODO: Add logic for context menu')}
            >
              <PiDotsThreeVerticalBold className="h-12 w-12" />
            </Button>
          </Card>
          <div className="flex flex-col gap-4 overflow-y-auto pb-20 text-white">
            {category.posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-white bg-opacity-5 p-4"
              >
                <h4>{post.title}</h4>
                <div
                  className="mt-3 text-gray-100"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulletinBoardPage;
