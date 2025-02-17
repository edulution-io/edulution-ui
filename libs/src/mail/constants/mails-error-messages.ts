/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

enum MailsErrorMessages {
  NotAbleToGetImapOption = 'mails.errors.NotAbleToGetImapOption',
  NotAbleToConnectClientError = 'mails.errors.NotAbleToConnectClientError',
  NotAbleToFetchMailsError = 'mails.errors.NotAbleToFetchMailsError',
  NotAbleToLockMailboxError = 'mails.errors.NotAbleToLockMailboxError',
  NotValidPortTypeError = 'mails.errors.NotValidPortTypeError',
  MailProviderNotFound = 'mails.errors.MailProviderNotFound',
  MailcowApiGetSyncJobsFailed = 'mails.errors.MailcowApiGetSyncJobsFailed',
  MailcowApiCreateSyncJobFailed = 'mails.errors.MailcowApiCreateSyncJobFailed',
  MailcowApiDeleteSyncJobsFailed = 'mails.errors.MailcowApiDeleteSyncJobsFailed',
}

export default MailsErrorMessages;
