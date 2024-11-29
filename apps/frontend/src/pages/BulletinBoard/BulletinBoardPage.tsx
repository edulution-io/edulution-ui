import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/shared/Card';

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
];

const BulletinBoardPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col p-4">
      <div className="flex flex-1 gap-4 overflow-x-auto">
        {dummyData.map((category) => (
          <div
            key={category.id}
            className="flex min-w-[300px] flex-1 flex-col rounded-lg p-4 shadow-lg"
          >
            <Card
              variant="security"
              className="mb-4 flex items-center justify-between rounded-lg py-1 pl-3 pr-2 opacity-90"
            >
              <h2 className="text-xl font-semibold text-foreground">{category.category}</h2>
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-foreground hover:bg-blue-600"
                title={t('Add Post')}
              >
                +
              </button>
            </Card>
            <div className="flex flex-col gap-4">
              {category.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg bg-white bg-opacity-5 p-4 text-white shadow-sm"
                >
                  <h3 className="text-lg font-bold ">{post.title}</h3>
                  <div
                    className="mt-2 text-sm text-gray-100"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletinBoardPage;
