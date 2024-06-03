import React from 'react';
import { Card, CardContent } from '@/components/shared/Card';

const MyFavourites = () => {
  const emailNotifications = [
    { id: 1, subject: 'Klassenarbeit 8a', sender: 'John Doe', date: '2024-06-01' },
    { id: 2, subject: 'Vertretungsplan KW 22', sender: 'Schulverwaltung', date: '2024-06-02' },
    { id: 3, subject: 'Mensa Speiseplan', sender: 'Mensa', date: '2024-06-03' },
    { id: 4, subject: 'Ferienbeginn', sender: 'Schulleitung', date: '2024-06-04' },
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
              className="flex items-center justify-between rounded bg-white p-4 shadow"
            >
              <div className="w-1/3">
                <p className="text-sm font-medium text-gray-700">{notification.subject}</p>
              </div>
              <div className="w-1/3">
                <p className="text-sm text-gray-500">{notification.sender}</p>
              </div>
              <div className="w-1/3 text-right">
                <p className="text-sm text-gray-400">{notification.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyFavourites;
