/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of the necessary backend types
 */

interface Mail {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
}

export default Mail;
