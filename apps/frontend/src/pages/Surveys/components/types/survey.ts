/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of the necessary backend types
 */

import Attendee from '@/pages/ConferencePage/dto/attendee';

export interface Survey {
  surveyname: string;
  survey: string;
  participants: Attendee[];
  saveNo: number;
  created?: Date;
  expires?: Date;
  isAnonymous?: boolean;
}
