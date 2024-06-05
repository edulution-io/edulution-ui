import React from 'react';
import { Card, CardContent } from '@/components/shared/Card';

const MyFavourites = () => {
  const emailNotifications = [
    { id: 4, subject: 'Ferienbeginn', sender: 'Schulleitung', date: '06.04.' },
    { id: 3, subject: 'Mensa Speiseplan', sender: 'Mensa', date: '06.03.' },
    { id: 2, subject: 'Vertretungsplan KW 22', sender: 'Schulverwaltung', date: '06.02.' },
    { id: 1, subject: 'Klassenarbeit 8a', sender: 'John Doe', date: '06.01.' },
  ];

  return (
    <Card
      variant="security"
      className="min-h-[100%]"
    >
      <CardContent>
        <h4
          color="white"
          className="font-bold"
        >
          Meine Benachrichtigungen
        </h4>
        <div className="mt-4 space-y-4">
          {emailNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between rounded bg-gray-700 p-4 shadow"
            >
              <div className="overflow-wrap-word w-2/5">
                <p className="text-sm font-medium text-white">{notification.subject}</p>
              </div>
              <div className="overflow-wrap-word w-2/5">
                <p className="text-sm text-white">{notification.sender}</p>
              </div>
              <div className="overflow-wrap-word w-1/5 text-right">
                <p className="text-sm text-white">{notification.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyFavourites;
