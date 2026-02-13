/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:

 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { join } from 'path';
import { Types } from 'mongoose';
import { pathExists, ensureDir, readdir, stat, move, remove } from 'fs-extra';
import { Logger } from '@nestjs/common';
import { publicUserLoginRegex } from '@libs/survey/utils/publicUserLoginRegex';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import { Migration } from '../../migration/migration.type';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '001-add-question-id-to-survey-answer-attachments-path';

const updateFileQuestionItem = async (
  questionId: string,
  item: object & { content: string },
  files: string[],
  oldPath: string,
  newPath: string,
): Promise<object & { content: string }> => {
  if (!item || typeof item !== 'object' || !('content' in item)) {
    return item;
  }

  const fileNameParts = item.content?.split('/');

  const fileName = fileNameParts.pop();
  if (!fileName) {
    return item;
  }

  await ensureDir(newPath);

  const newUrl = [...fileNameParts, questionId, fileName].join('/');

  const oldFilePath = join(oldPath, fileName);
  const newFilePath = join(newPath, fileName);
  const indexOfFile = files.indexOf(fileName);
  if (indexOfFile !== -1) {
    await move(oldFilePath, newFilePath, { overwrite: false });
    files.splice(indexOfFile, 1);
  }

  const remainingFiles = await readdir(oldPath);
  if (remainingFiles.length === 0) {
    await remove(oldPath);
  }

  const parentFolder = oldPath.split('/').slice(0, -1).join('/');
  const remainingFilesInParentFolder = await readdir(parentFolder);
  if (remainingFilesInParentFolder.length === 0) {
    await remove(parentFolder);
  }

  return { ...item, content: newUrl };
};

const updateSurveyQuestionAnswer = async (
  userName: string,
  surveyId: string,
  surveyAnswer: Record<string, (object & { content: string }) | (object & { content: string })[]>,
): Promise<Record<string, (object & { content: string }) | (object & { content: string })[]>> => {
  const path = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, userName);

  const files: string[] = [];
  if (await pathExists(path)) {
    const items = await readdir(path);
    await Promise.all(
      items.map(async (fileName) => {
        const filePath = join(path, fileName);
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          files.push(fileName);
        }
      }),
    );
  }
  if (files.length === 0) {
    return surveyAnswer;
  }

  const answer: Record<string, (object & { content: string }) | (object & { content: string })[]> = { ...surveyAnswer };
  await Promise.all(
    Object.keys(surveyAnswer).map(async (questionId) => {
      const newPath = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, questionId, userName);
      const progressedFiles: (object & { content: string })[] = [];
      const question = surveyAnswer[questionId];
      if (Array.isArray(question)) {
        await Promise.all(
          question.map(async (item: object & { content: string }) => {
            const updatedItem = await updateFileQuestionItem(questionId, item, files, path, newPath);
            progressedFiles.push(updatedItem);
          }),
        );
        answer[questionId] = progressedFiles;
        return answer;
      }
      const updatedItem = await updateFileQuestionItem(questionId, question, files, path, newPath);
      progressedFiles.push(updatedItem);
      answer[questionId] = progressedFiles;
      return answer;
    }),
  );
  return answer;
};

const surveyAnswerMigration001AddQuestionIdToSurveyAnswerAttachments: Migration<SurveyAnswerDocument> = {
  name,
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 1;
    const newSchemaVersion = 2;

    const unprocessedDocuments = await model
      .find<SurveyAnswerDocument>({ schemaVersion: previousSchemaVersion })
      .sort({ _id: 1 })
      .exec();

    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`Found ${unprocessedDocuments.length} documents to process...`);

    let processedCount = 0;

    await Promise.all(
      unprocessedDocuments.map(async (doc: SurveyAnswerDocument) => {
        // eslint-disable-next-line no-underscore-dangle
        const id = doc._id as string | Types.ObjectId;

        let currentId;
        if (id instanceof Types.ObjectId) {
          currentId = id;
        } else {
          currentId = new Types.ObjectId(id);
        }

        const surveyId = String(doc.surveyId);

        const isPublicUserParticipation = !!doc.attendee?.username && publicUserLoginRegex.test(doc.attendee?.username);
        const userName = isPublicUserParticipation
          ? doc.attendee?.firstName || doc.attendee?.username
          : doc.attendee?.username;

        const answer = doc.answer as unknown as Record<
          string,
          (object & { content: string }) | (object & { content: string })[]
        >;

        try {
          const updatedAnswer = await updateSurveyQuestionAnswer(userName, surveyId, answer);
          await model.updateOne(
            { _id: currentId },
            { $set: { answer: updatedAnswer, schemaVersion: newSchemaVersion } },
          );
          processedCount += 1;
        } catch (error) {
          Logger.error(`Failed to migrate document ${doc.id}:`, error);
        }
      }),
    );

    if (processedCount > 0) {
      Logger.log(`Migration ${name} completed: ${processedCount} documents migrated`);
    }
  },
};

export default surveyAnswerMigration001AddQuestionIdToSurveyAnswerAttachments;
