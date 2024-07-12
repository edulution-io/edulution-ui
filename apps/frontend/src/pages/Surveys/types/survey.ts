// TODO: NIEDUUI-221: Move the types to the shared section (coming soon)
/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of the necessary backend types
 */

import Attendee from '@/pages/ConferencePage/dto/attendee.ts';

export interface Survey {
  id: number;
  formula: JSON;
  publicAnswers: JSON[];
  participants: Attendee[];
  participated: string[];
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;
}
