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

import NotificationTemplate from '@libs/notification/types/notificationTemplate';

const notificationTemplates = {
  conference: {
    started: {
      title: {
        EN: 'Conference started: {{name}}',
        DE: 'Konferenz gestartet: {{name}}',
        FR: 'Conférence démarrée : {{name}}',
      },
      body: {
        EN: 'The conference "{{name}}" has started.',
        DE: 'Die Konferenz "{{name}}" hat begonnen.',
        FR: 'La conférence "{{name}}" a commencé.',
      },
    },
  },
  bulletin: {
    ready: {
      title: {
        EN: 'Bulletin ready: {{title}}',
        DE: 'Mitteilung bereit: {{title}}',
        FR: 'Bulletin prêt : {{title}}',
      },
      body: {
        EN: 'The bulletin "{{title}}" is now available.',
        DE: 'Die Mitteilung "{{title}}" ist jetzt verfügbar.',
        FR: 'Le bulletin "{{title}}" est maintenant disponible.',
      },
    },
  },
  survey: {
    created: {
      title: {
        EN: 'Survey created: {{title}}',
        DE: 'Umfrage erstellt: {{title}}',
        FR: 'Sondage créé : {{title}}',
      },
      body: {
        EN: 'The survey "{{title}}" has just been created.',
        DE: 'Die Umfrage "{{title}}" wurde gerade erstellt.',
        FR: 'Le sondage "{{title}}" vient d\'être créé.',
      },
    },
    updated: {
      title: {
        EN: 'Survey updated: {{title}}',
        DE: 'Umfrage aktualisiert: {{title}}',
        FR: 'Sondage mis à jour : {{title}}',
      },
      body: {
        EN: 'The survey "{{title}}" has just been updated.',
        DE: 'Die Umfrage "{{title}}" wurde gerade aktualisiert.',
        FR: 'Le sondage "{{title}}" vient d\'être mis à jour.',
      },
    },
  },
} as const satisfies Record<string, Record<string, NotificationTemplate>>;

export default notificationTemplates;
